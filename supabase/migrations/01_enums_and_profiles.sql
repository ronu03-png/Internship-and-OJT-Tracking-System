-- =============================================================================
-- 01_enums_and_profiles.sql
-- Internship & OJT Tracking System  |  CHED CMO No. 104, s. 2017 compliant
-- Target: Supabase (PostgreSQL 15+)
--
-- This migration defines the shared enum types and the public.profiles table
-- that mirrors auth.users. Run migrations in numeric order (01 -> 05).
-- =============================================================================

-- Enable extensions used across the schema.
create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "postgis";        -- optional: richer geofencing
                                                  -- (safe to remove if unused)

-- -----------------------------------------------------------------------------
-- Enum types
-- -----------------------------------------------------------------------------

-- Three distinct system roles: student, supervisor, administrator.
do $$ begin
  create type public.user_role as enum ('student', 'supervisor', 'admin');
exception when duplicate_object then null; end $$;

-- Document processing state machine.
do $$ begin
  create type public.document_status as enum (
    'pending',       -- expected but not yet uploaded
    'uploaded',      -- file received, awaiting queue
    'under_review',  -- supervisor is reviewing
    'approved',      -- accepted, satisfies requirement
    'rejected'       -- rejected, student must re-upload
  );
exception when duplicate_object then null; end $$;

-- Lifecycle phase of a document relative to deployment.
do $$ begin
  create type public.document_phase as enum (
    'pre_deployment',   -- consent, endorsement, medical, MOA, etc.
    'mid_deployment',   -- weekly narrative journals
    'post_deployment'   -- certificate of completion, final portfolio
  );
exception when duplicate_object then null; end $$;

-- DTR (Daily Time Record) session state.
do $$ begin
  create type public.dtr_status as enum (
    'open',              -- clocked in, not yet clocked out
    'pending_approval',  -- clocked out, awaiting supervisor sign-off
    'approved',          -- supervisor approved -> hours counted
    'rejected'           -- supervisor rejected -> hours NOT counted
  );
exception when duplicate_object then null; end $$;

-- Overall internship status.
do $$ begin
  create type public.internship_status as enum (
    'pending', 'active', 'completed', 'terminated'
  );
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- profiles : public mirror of auth.users
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text unique not null,
  full_name    text not null default '',
  user_role    public.user_role not null default 'student',
  phone        text,
  -- For supervisors: the HTE they belong to (nullable for students/admins).
  hte_id       uuid,  -- FK added in 02 after htes exists (avoids ordering issue)
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is
  'Application profile for every auth.users row. user_role drives RLS.';

-- Keep updated_at fresh on any row change.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create index if not exists idx_profiles_role on public.profiles (user_role);
create index if not exists idx_profiles_hte  on public.profiles (hte_id);
