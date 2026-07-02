-- =============================================================================
-- 05_rls_policies.sql
-- Row-Level Security for every table.
-- Depends on: 01, 02, 03, 04
--
-- Role matrix:
--   student    -> own rows only (insert/select own DTR + documents + journals)
--   supervisor -> read/update rows for students linked to THEIR HTE/internship
--   admin      -> full read/write everywhere (compliance auditing)
--
-- NOTE: policies call SECURITY DEFINER helpers (is_admin / is_supervisor_of)
-- to avoid infinite recursion when a policy on profiles needs to read profiles.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER, bypass RLS internally)
-- -----------------------------------------------------------------------------
create or replace function public.my_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select user_role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.my_role() = 'admin', false);
$$;

-- True when the current user is the supervisor linked to the given internship,
-- either directly (internships.supervisor_id) or via the HTE they belong to.
create or replace function public.is_supervisor_of(p_internship_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.internships i
    join public.profiles sup on sup.id = auth.uid()
    where i.id = p_internship_id
      and sup.user_role = 'supervisor'
      and (i.supervisor_id = sup.id or i.hte_id = sup.hte_id)
  );
$$;

-- True when the current user owns (is the student on) the given internship.
create or replace function public.is_student_of(p_internship_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.internships i
    where i.id = p_internship_id and i.student_id = auth.uid()
  );
$$;

-- =============================================================================
-- Enable RLS on all tables
-- =============================================================================
alter table public.profiles    enable row level security;
alter table public.htes        enable row level security;
alter table public.internships enable row level security;
alter table public.dtr_logs    enable row level security;
alter table public.documents   enable row level security;
alter table public.journals    enable row level security;

-- =============================================================================
-- profiles
-- =============================================================================
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (
    id = auth.uid()                         -- own profile
    or public.is_admin()                    -- admin sees all
    -- supervisor can see profiles of students in their HTE
    or (public.my_role() = 'supervisor' and exists (
          select 1 from public.internships i
          join public.profiles sup on sup.id = auth.uid()
          where i.student_id = profiles.id
            and (i.supervisor_id = sup.id or i.hte_id = sup.hte_id)
       ))
  );

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- htes  (admins manage; everyone authenticated may read active HTEs)
-- =============================================================================
drop policy if exists htes_select on public.htes;
create policy htes_select on public.htes
  for select using (auth.uid() is not null);

drop policy if exists htes_admin_write on public.htes;
create policy htes_admin_write on public.htes
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- internships
-- =============================================================================
drop policy if exists internships_select on public.internships;
create policy internships_select on public.internships
  for select using (
    student_id = auth.uid()
    or public.is_admin()
    or public.is_supervisor_of(id)
  );

drop policy if exists internships_admin_write on public.internships;
create policy internships_admin_write on public.internships
  for all using (public.is_admin()) with check (public.is_admin());

-- Supervisors may update engagements they own (e.g. assign dates/status).
drop policy if exists internships_supervisor_update on public.internships;
create policy internships_supervisor_update on public.internships
  for update using (public.is_supervisor_of(id))
  with check (public.is_supervisor_of(id));

-- =============================================================================
-- dtr_logs
--   students: insert + select OWN
--   supervisors: select + update (approve) for THEIR students
--   admin: everything
-- =============================================================================
drop policy if exists dtr_select on public.dtr_logs;
create policy dtr_select on public.dtr_logs
  for select using (
    student_id = auth.uid()
    or public.is_admin()
    or public.is_supervisor_of(internship_id)
  );

drop policy if exists dtr_student_insert on public.dtr_logs;
create policy dtr_student_insert on public.dtr_logs
  for insert with check (
    student_id = auth.uid() and public.is_student_of(internship_id)
  );

-- Students may update ONLY their own still-open session (e.g. via clock_out),
-- and may never self-approve.
drop policy if exists dtr_student_update on public.dtr_logs;
create policy dtr_student_update on public.dtr_logs
  for update using (student_id = auth.uid() and status in ('open'))
  with check (student_id = auth.uid() and status in ('open', 'pending_approval'));

-- Supervisors approve/reject DTRs of their students.
drop policy if exists dtr_supervisor_update on public.dtr_logs;
create policy dtr_supervisor_update on public.dtr_logs
  for update using (public.is_supervisor_of(internship_id))
  with check (public.is_supervisor_of(internship_id));

drop policy if exists dtr_admin_all on public.dtr_logs;
create policy dtr_admin_all on public.dtr_logs
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- documents
-- =============================================================================
drop policy if exists documents_select on public.documents;
create policy documents_select on public.documents
  for select using (
    student_id = auth.uid()
    or public.is_admin()
    or public.is_supervisor_of(internship_id)
  );

drop policy if exists documents_student_insert on public.documents;
create policy documents_student_insert on public.documents
  for insert with check (
    student_id = auth.uid() and public.is_student_of(internship_id)
  );

-- Students may update their own docs only while not yet approved (re-upload).
drop policy if exists documents_student_update on public.documents;
create policy documents_student_update on public.documents
  for update using (student_id = auth.uid() and status <> 'approved')
  with check (student_id = auth.uid());

-- Admin performs the review transitions (approve/reject).
drop policy if exists documents_admin_all on public.documents;
create policy documents_admin_all on public.documents
  for all using (public.is_admin()) with check (public.is_admin());

-- Supervisors may move linked students' docs into review states.
drop policy if exists documents_supervisor_update on public.documents;
create policy documents_supervisor_update on public.documents
  for update using (public.is_supervisor_of(internship_id))
  with check (public.is_supervisor_of(internship_id));

-- =============================================================================
-- journals
-- =============================================================================
drop policy if exists journals_select on public.journals;
create policy journals_select on public.journals
  for select using (
    student_id = auth.uid()
    or public.is_admin()
    or public.is_supervisor_of(internship_id)
  );

drop policy if exists journals_student_write on public.journals;
create policy journals_student_write on public.journals
  for insert with check (
    student_id = auth.uid() and public.is_student_of(internship_id)
  );

drop policy if exists journals_student_update on public.journals;
create policy journals_student_update on public.journals
  for update using (student_id = auth.uid() and status <> 'approved')
  with check (student_id = auth.uid());

drop policy if exists journals_reviewer_update on public.journals;
create policy journals_reviewer_update on public.journals
  for update using (public.is_admin() or public.is_supervisor_of(internship_id))
  with check (public.is_admin() or public.is_supervisor_of(internship_id));

drop policy if exists journals_admin_all on public.journals;
create policy journals_admin_all on public.journals
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- Storage RLS (buckets: 'ojt-documents', 'ojt-journals')
-- Convention: object path is prefixed with the owner's user id:
--   {auth.uid()}/pre_deployment/medical.pdf
-- Create the buckets in the dashboard (or via storage.create_bucket) first.
-- =============================================================================
drop policy if exists storage_owner_rw on storage.objects;
create policy storage_owner_rw on storage.objects
  for all
  using (
    bucket_id in ('ojt-documents', 'ojt-journals')
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  )
  with check (
    bucket_id in ('ojt-documents', 'ojt-journals')
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- =============================================================================
-- Grants: expose RPCs to authenticated users (RLS still enforced inside).
-- =============================================================================
grant execute on function public.clock_in(uuid, double precision, double precision)  to authenticated;
grant execute on function public.clock_out(uuid, double precision, double precision) to authenticated;
grant execute on function public.approve_dtr(uuid, boolean, text)                     to authenticated;
grant execute on function public.baseline_requirements_met(uuid)                      to authenticated;
