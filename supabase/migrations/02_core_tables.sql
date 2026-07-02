-- =============================================================================
-- 02_core_tables.sql
-- Core domain tables: htes, internships, dtr_logs, documents, journals.
-- Depends on: 01_enums_and_profiles.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- htes : Host Training Establishments (partner companies)
-- -----------------------------------------------------------------------------
create table if not exists public.htes (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  address            text,
  industry           text,
  contact_email      text,
  contact_phone      text,
  -- Geofence center + allowed radius (metres) for DTR location verification.
  geofence_lat       double precision,
  geofence_lng       double precision,
  geofence_radius_m  integer not null default 200,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.htes is 'Host Training Establishments partnered with the school.';

-- Now that htes exists, wire the FK from profiles.hte_id (supervisors).
do $$ begin
  alter table public.profiles
    add constraint fk_profiles_hte
    foreign key (hte_id) references public.htes (id) on delete set null;
exception when duplicate_object then null; end $$;

drop trigger if exists trg_htes_updated_at on public.htes;
create trigger trg_htes_updated_at
  before update on public.htes
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- internships : one active OJT engagement per student
-- -----------------------------------------------------------------------------
create table if not exists public.internships (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.profiles (id) on delete cascade,
  hte_id          uuid not null references public.htes (id)     on delete restrict,
  supervisor_id   uuid references public.profiles (id)          on delete set null,
  course          text,
  required_hours  numeric(6,2) not null default 486,   -- CMO-defined minimum
  hours_rendered  numeric(7,2) not null default 0,      -- maintained by trigger
  status          public.internship_status not null default 'pending',
  start_date      date,
  end_date        date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- A student may only have one non-terminated internship at a time.
  constraint uq_internship_active_student
    unique (student_id, status) deferrable initially deferred
);

comment on table public.internships is
  'A student''s OJT placement. hours_rendered is auto-maintained by the DTR engine.';

create index if not exists idx_internships_student    on public.internships (student_id);
create index if not exists idx_internships_supervisor on public.internships (supervisor_id);
create index if not exists idx_internships_hte        on public.internships (hte_id);

drop trigger if exists trg_internships_updated_at on public.internships;
create trigger trg_internships_updated_at
  before update on public.internships
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- dtr_logs : Daily Time Record sessions
-- All timestamps are server-side (see 04_dtr_logic.sql). GPS captured per punch.
-- -----------------------------------------------------------------------------
create table if not exists public.dtr_logs (
  id              uuid primary key default gen_random_uuid(),
  internship_id   uuid not null references public.internships (id) on delete cascade,
  student_id      uuid not null references public.profiles (id)    on delete cascade,
  log_date        date not null default (now() at time zone 'Asia/Manila')::date,

  time_in         timestamptz not null,   -- set by clock_in() using now()
  time_out        timestamptz,            -- set by clock_out() using now()

  -- GPS captured at each punch for geofence verification.
  time_in_lat     double precision,
  time_in_lng     double precision,
  time_out_lat    double precision,
  time_out_lng    double precision,

  rendered_hours  numeric(5,2) not null default 0,  -- computed on approval
  status          public.dtr_status not null default 'open',

  approved_by     uuid references public.profiles (id) on delete set null,
  approved_at     timestamptz,
  remarks         text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint chk_time_order check (time_out is null or time_out > time_in)
);

comment on table public.dtr_logs is
  'Server-timestamped clock-in/out records with GPS. Hours computed on approval.';

-- Guardrail 1: at most ONE open session per internship at any time.
create unique index if not exists uq_dtr_one_open_session
  on public.dtr_logs (internship_id)
  where status = 'open';

-- Guardrail 2: at most ONE log per internship per calendar day.
create unique index if not exists uq_dtr_one_per_day
  on public.dtr_logs (internship_id, log_date);

create index if not exists idx_dtr_student on public.dtr_logs (student_id);
create index if not exists idx_dtr_status  on public.dtr_logs (status);

drop trigger if exists trg_dtr_updated_at on public.dtr_logs;
create trigger trg_dtr_updated_at
  before update on public.dtr_logs
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- documents : requirement submissions bound to a Supabase Storage object
-- -----------------------------------------------------------------------------
create table if not exists public.documents (
  id              uuid primary key default gen_random_uuid(),
  internship_id   uuid not null references public.internships (id) on delete cascade,
  student_id      uuid not null references public.profiles (id)    on delete cascade,
  phase           public.document_phase not null,
  doc_type        text not null,     -- e.g. 'parents_consent', 'medical_certificate'
  title           text,
  -- Object path inside the Supabase Storage bucket (e.g. 'ojt-documents').
  storage_bucket  text not null default 'ojt-documents',
  storage_path    text,
  status          public.document_status not null default 'pending',
  -- Marks a pre-deployment file as mandatory before attendance may begin.
  is_baseline     boolean not null default false,
  reviewed_by     uuid references public.profiles (id) on delete set null,
  reviewed_at     timestamptz,
  remarks         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.documents is
  'Document workflow records. is_baseline pre-deployment docs gate attendance.';

create index if not exists idx_documents_internship on public.documents (internship_id);
create index if not exists idx_documents_status     on public.documents (status);
create index if not exists idx_documents_baseline    on public.documents (internship_id, is_baseline);

drop trigger if exists trg_documents_updated_at on public.documents;
create trigger trg_documents_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- journals : weekly narrative logs (mid-deployment) with photo documentation
-- -----------------------------------------------------------------------------
create table if not exists public.journals (
  id               uuid primary key default gen_random_uuid(),
  internship_id    uuid not null references public.internships (id) on delete cascade,
  student_id       uuid not null references public.profiles (id)    on delete cascade,
  week_no          integer not null,
  tasks_completed  text not null,
  learnings        text,
  -- Photo documentation stored in Supabase Storage.
  photo_bucket     text not null default 'ojt-journals',
  photo_path       text,
  status           public.document_status not null default 'uploaded',
  reviewed_by      uuid references public.profiles (id) on delete set null,
  reviewed_at      timestamptz,
  remarks          text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint uq_journal_week unique (internship_id, week_no)
);

comment on table public.journals is 'Weekly narrative journals with photo evidence.';

create index if not exists idx_journals_internship on public.journals (internship_id);

drop trigger if exists trg_journals_updated_at on public.journals;
create trigger trg_journals_updated_at
  before update on public.journals
  for each row execute function public.set_updated_at();
