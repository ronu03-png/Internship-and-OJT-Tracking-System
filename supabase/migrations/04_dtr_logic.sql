-- =============================================================================
-- 04_dtr_logic.sql
-- Bulletproof, server-side DTR engine:
--   * Anti-tampering clock in/out (NOW() only, never client time)
--   * Overlap / double-punch guardrails
--   * Requirement-locked attendance (baseline docs must be approved)
--   * Automated hour engine on supervisor approval (1h lunch deduction > 5h)
-- Depends on: 01, 02
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helper: are ALL baseline (mandatory pre-deployment) documents approved?
-- Attendance stays locked until this returns true.
-- -----------------------------------------------------------------------------
create or replace function public.baseline_requirements_met(p_internship_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.documents d
    where d.internship_id = p_internship_id
      and d.is_baseline = true
      and d.status <> 'approved'
  )
  -- Require at least one baseline doc on file, otherwise nothing to clear.
  and exists (
    select 1
    from public.documents d
    where d.internship_id = p_internship_id
      and d.is_baseline = true
  );
$$;

comment on function public.baseline_requirements_met(uuid) is
  'True only when every baseline pre-deployment document is approved.';

-- -----------------------------------------------------------------------------
-- clock_in : opens a DTR session using the SERVER clock and captured GPS.
-- SECURITY DEFINER + explicit ownership check = students cannot spoof time.
-- -----------------------------------------------------------------------------
create or replace function public.clock_in(
  p_internship_id uuid,
  p_lat           double precision default null,
  p_lng           double precision default null
)
returns public.dtr_logs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_row    public.dtr_logs;
  v_today  date := (now() at time zone 'Asia/Manila')::date;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  -- Ownership: caller must be the student on this internship.
  if not exists (
    select 1 from public.internships i
    where i.id = p_internship_id and i.student_id = v_uid
  ) then
    raise exception 'You may only clock in for your own internship'
      using errcode = '42501';
  end if;

  -- Requirement lock: baseline documents must be approved first.
  if not public.baseline_requirements_met(p_internship_id) then
    raise exception 'Attendance locked: pre-deployment requirements are not yet approved'
      using errcode = 'P0001';
  end if;

  -- Guardrail: no other open session.
  if exists (
    select 1 from public.dtr_logs
    where internship_id = p_internship_id and status = 'open'
  ) then
    raise exception 'You already have an open session. Clock out first.'
      using errcode = 'P0001';
  end if;

  -- Guardrail: only one log per day.
  if exists (
    select 1 from public.dtr_logs
    where internship_id = p_internship_id and log_date = v_today
  ) then
    raise exception 'You have already logged attendance today.'
      using errcode = 'P0001';
  end if;

  insert into public.dtr_logs (
    internship_id, student_id, log_date,
    time_in, time_in_lat, time_in_lng, status
  )
  values (
    p_internship_id, v_uid, v_today,
    now(),            -- SERVER timestamp, not client-provided
    p_lat, p_lng, 'open'
  )
  returning * into v_row;

  return v_row;
end;
$$;

comment on function public.clock_in(uuid, double precision, double precision) is
  'Opens a DTR session with server time + GPS. Enforces ownership, locks and guardrails.';

-- -----------------------------------------------------------------------------
-- clock_out : closes the open DTR session using the SERVER clock and GPS.
-- -----------------------------------------------------------------------------
create or replace function public.clock_out(
  p_internship_id uuid,
  p_lat           double precision default null,
  p_lng           double precision default null
)
returns public.dtr_logs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.dtr_logs;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if not exists (
    select 1 from public.internships i
    where i.id = p_internship_id and i.student_id = v_uid
  ) then
    raise exception 'You may only clock out for your own internship'
      using errcode = '42501';
  end if;

  update public.dtr_logs
     set time_out      = now(),   -- SERVER timestamp
         time_out_lat  = p_lat,
         time_out_lng  = p_lng,
         status        = 'pending_approval'
   where internship_id = p_internship_id
     and status = 'open'
  returning * into v_row;

  if v_row.id is null then
    raise exception 'No open session to clock out from.' using errcode = 'P0001';
  end if;

  return v_row;
end;
$$;

comment on function public.clock_out(uuid, double precision, double precision) is
  'Closes the open DTR session with server time + GPS. Moves it to pending_approval.';

-- -----------------------------------------------------------------------------
-- compute_dtr_hours : raw hours between two timestamps with lunch deduction.
--   Deducts 1 hour when the continuous shift exceeds 5 hours.
-- -----------------------------------------------------------------------------
create or replace function public.compute_dtr_hours(
  p_time_in  timestamptz,
  p_time_out timestamptz
)
returns numeric
language plpgsql
immutable
as $$
declare
  v_gross numeric;
  v_net   numeric;
begin
  if p_time_in is null or p_time_out is null or p_time_out <= p_time_in then
    return 0;
  end if;

  v_gross := extract(epoch from (p_time_out - p_time_in)) / 3600.0;

  -- CMO practice: subtract a 1-hour lunch break for shifts over 5 hours.
  if v_gross > 5 then
    v_net := v_gross - 1;
  else
    v_net := v_gross;
  end if;

  return round(v_net, 2);
end;
$$;

-- -----------------------------------------------------------------------------
-- Automated hour engine: recompute rendered hours and keep the internship
-- aggregate (hours_rendered) accurate whenever a DTR row's approval state or
-- times change. Handles approve, un-approve, reject and edits idempotently.
-- -----------------------------------------------------------------------------
create or replace function public.apply_dtr_hours()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_hours numeric := 0;   -- hours previously counted for this row
  v_new_hours numeric := 0;   -- hours to count after this change
begin
  -- How many hours did this row contribute BEFORE the change?
  if tg_op = 'UPDATE' and old.status = 'approved' then
    v_old_hours := coalesce(old.rendered_hours, 0);
  end if;

  -- Compute the row's hours and how many it contributes AFTER the change.
  if new.status = 'approved' then
    new.rendered_hours := public.compute_dtr_hours(new.time_in, new.time_out);
    new.approved_at    := coalesce(new.approved_at, now());
    v_new_hours        := new.rendered_hours;
  else
    -- Not approved -> contributes nothing and its stored hours reset to 0.
    new.rendered_hours := 0;
    v_new_hours        := 0;
    if new.status <> 'approved' then
      new.approved_at := null;
      new.approved_by := null;
    end if;
  end if;

  -- Adjust the master aggregate by the delta only (idempotent).
  if (v_new_hours - v_old_hours) <> 0 then
    update public.internships
       set hours_rendered = greatest(0, hours_rendered + (v_new_hours - v_old_hours))
     where id = new.internship_id;

    -- Auto-complete the internship once the required hours are met.
    update public.internships
       set status = 'completed'
     where id = new.internship_id
       and status = 'active'
       and hours_rendered >= required_hours;
  end if;

  return new;
end;
$$;

comment on function public.apply_dtr_hours() is
  'Maintains dtr_logs.rendered_hours and internships.hours_rendered via deltas.';

-- BEFORE trigger so we can mutate NEW.rendered_hours in place.
drop trigger if exists trg_dtr_apply_hours on public.dtr_logs;
create trigger trg_dtr_apply_hours
  before insert or update of status, time_in, time_out on public.dtr_logs
  for each row execute function public.apply_dtr_hours();

-- When an approved DTR row is deleted, subtract its hours from the aggregate.
create or replace function public.revert_dtr_hours()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'approved' and coalesce(old.rendered_hours, 0) > 0 then
    update public.internships
       set hours_rendered = greatest(0, hours_rendered - old.rendered_hours)
     where id = old.internship_id;
  end if;
  return old;
end;
$$;

drop trigger if exists trg_dtr_revert_hours on public.dtr_logs;
create trigger trg_dtr_revert_hours
  after delete on public.dtr_logs
  for each row execute function public.revert_dtr_hours();

-- -----------------------------------------------------------------------------
-- approve_dtr : convenience RPC for supervisors to approve/reject a log.
-- RLS still applies; this just centralises the state transition.
-- -----------------------------------------------------------------------------
create or replace function public.approve_dtr(
  p_dtr_id  uuid,
  p_approve boolean default true,
  p_remarks text default null
)
returns public.dtr_logs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.dtr_logs;
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  -- Supervisor must be linked to the student's internship, or be an admin.
  if not exists (
    select 1
    from public.dtr_logs d
    join public.internships i on i.id = d.internship_id
    where d.id = p_dtr_id
      and (
        i.supervisor_id = v_uid
        or exists (select 1 from public.profiles p
                   where p.id = v_uid and p.user_role = 'admin')
      )
  ) then
    raise exception 'Not authorised to review this DTR' using errcode = '42501';
  end if;

  update public.dtr_logs
     set status      = case when p_approve then 'approved' else 'rejected' end,
         approved_by = v_uid,
         approved_at = case when p_approve then now() else null end,
         remarks     = p_remarks
   where id = p_dtr_id
  returning * into v_row;

  return v_row;
end;
$$;

comment on function public.approve_dtr(uuid, boolean, text) is
  'Supervisor/admin approval switch that drives the automated hour engine.';
