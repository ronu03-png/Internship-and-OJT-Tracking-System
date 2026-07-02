-- =============================================================================
-- seed.sql  (OPTIONAL, for local/testing on Supabase)
-- Sample HTE, internship, baseline documents and DTR rows so you can exercise
-- the triggers, RLS, and the openpyxl report end-to-end.
--
-- PREREQUISITE: create the auth users first (they cannot be inserted directly
-- here). Either sign them up via the app, or use the Supabase Admin API, e.g.:
--
--   -- via SQL using Supabase's admin helper (service role / SQL editor):
--   select auth.uid();  -- confirm you are service role
--
-- Then set the two UUIDs below to the created users' ids and run this file.
-- =============================================================================

-- >>> EDIT THESE TWO IDS to match real auth.users rows <<<
\set student_id  '00000000-0000-0000-0000-000000000001'
\set super_id    '00000000-0000-0000-0000-000000000002'

-- If you are pasting into the Supabase SQL editor (no psql \set support),
-- replace :'student_id' / :'super_id' below with literal UUID strings.

-- Ensure profiles exist / have the right roles (handle_new_user usually did this).
insert into public.profiles (id, email, full_name, user_role)
values
  (:'student_id', 'student.demo@example.edu', 'Juan Dela Cruz', 'student')
on conflict (id) do update set user_role = 'student';

insert into public.profiles (id, email, full_name, user_role)
values
  (:'super_id', 'supervisor.demo@example.com', 'Maria Santos', 'supervisor')
on conflict (id) do update set user_role = 'supervisor';

-- HTE with a geofence (BGC, Taguig as an example center).
with new_hte as (
  insert into public.htes (name, address, industry, geofence_lat, geofence_lng, geofence_radius_m)
  values ('Acme Digital Solutions Inc.', '5th Ave, BGC, Taguig', 'Software',
          14.5507, 121.0490, 250)
  returning id
)
-- Link the supervisor to the HTE.
update public.profiles p
   set hte_id = (select id from new_hte)
 where p.id = :'super_id';

-- Create the internship.
insert into public.internships (student_id, hte_id, supervisor_id, course,
                                required_hours, status, start_date, end_date)
select :'student_id',
       h.id,
       :'super_id',
       'BS Information Technology',
       486, 'active', current_date - 20, current_date + 40
from public.htes h
where h.name = 'Acme Digital Solutions Inc.'
limit 1;

-- Baseline pre-deployment documents (all approved so attendance is unlocked).
insert into public.documents (internship_id, student_id, phase, doc_type, title,
                              status, is_baseline, storage_path)
select i.id, i.student_id, 'pre_deployment', d.doc_type, d.title,
       'approved', true, :'student_id' || '/pre_deployment/' || d.doc_type || '.pdf'
from public.internships i
cross join (values
  ('parents_consent',     'Notarized Parent''s Consent'),
  ('endorsement_letter',  'Endorsement Letter'),
  ('medical_certificate', 'Medical Certificate'),
  ('resume',              'Resume')
) as d(doc_type, title)
where i.student_id = :'student_id';

-- A few approved DTR rows (triggers will compute rendered_hours + aggregate).
insert into public.dtr_logs (internship_id, student_id, log_date, time_in, time_out, status)
select i.id, i.student_id,
       (current_date - g)::date,
       ((current_date - g) + time '08:00')::timestamptz,
       ((current_date - g) + time '17:00')::timestamptz,
       'approved'
from public.internships i
cross join generate_series(1, 5) as g
where i.student_id = :'student_id'
on conflict (internship_id, log_date) do nothing;

-- Verify:
--   select full_name, hours_rendered, required_hours from internships
--   join profiles on profiles.id = internships.student_id;
