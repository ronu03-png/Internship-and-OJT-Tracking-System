# Supabase / PostgreSQL Backend — CHED CMO No. 104 (s. 2017)

Standalone, self-contained database layer for the Internship & OJT Tracking
System. These files are **reference/compliance artifacts** — they are
independent of the app's current SQLite + Express backend and do not modify it.

## What's here

| File | Purpose |
|------|---------|
| `migrations/01_enums_and_profiles.sql` | Enum types + `profiles` mirror of `auth.users`. |
| `migrations/02_core_tables.sql` | `htes`, `internships`, `dtr_logs`, `documents`, `journals`. |
| `migrations/03_auth_trigger.sql` | Trigger that inserts a profile on new `auth.users`. |
| `migrations/04_dtr_logic.sql` | Server-side clock in/out, guardrails, requirement lock, auto hour engine. |
| `migrations/05_rls_policies.sql` | Row-Level Security for every table + Storage. |

Run them **in numeric order** (01 → 05).

## Applying the migrations

### Option A — Supabase SQL Editor
1. Open your project → **SQL Editor**.
2. Paste and run each file in order.

### Option B — Supabase CLI
```bash
supabase db push          # if using the CLI's migration workflow
# or run each file:
psql "$DATABASE_URL" -f migrations/01_enums_and_profiles.sql
psql "$DATABASE_URL" -f migrations/02_core_tables.sql
psql "$DATABASE_URL" -f migrations/03_auth_trigger.sql
psql "$DATABASE_URL" -f migrations/04_dtr_logic.sql
psql "$DATABASE_URL" -f migrations/05_rls_policies.sql
```

### Storage buckets
Create two buckets (Dashboard → Storage), both **private**:
- `ojt-documents`
- `ojt-journals`

Store objects under a path prefixed with the owner's user id so the Storage RLS
policy matches, e.g. `‹auth.uid()›/pre_deployment/medical.pdf`.

## How the key requirements are satisfied

### 1. Auth integration
`handle_new_user()` (SECURITY DEFINER, hardened `search_path`) fires
`after insert on auth.users`, reading `raw_user_meta_data` to map
`user_role` → `('student','supervisor','admin')`. Pass metadata at sign-up:

```js
await supabase.auth.signUp({
  email, password,
  options: { data: { full_name: 'Juan Dela Cruz', user_role: 'student' } }
});
```

### 2. Row-Level Security
- **Students** — insert/select only their own DTR logs, documents, journals.
- **Supervisors** — select/update rows for students linked to their HTE
  (`internships.supervisor_id` or shared `hte_id`); can approve DTRs/grade.
- **Admins** — full read/write everywhere for auditing.

Recursion on `profiles` is avoided with SECURITY DEFINER helpers
(`is_admin()`, `my_role()`, `is_supervisor_of()`, `is_student_of()`).

### 3. Bulletproof DTR
- `clock_in()` / `clock_out()` use **`now()` (server time)** only — client time
  is never trusted.
- GPS (lat/lng) captured at each punch for geofencing; HTE stores
  `geofence_lat/lng/radius_m`.
- Guardrails via partial unique indexes: **one open session** and **one log per
  day** per internship.
- **Requirement lock**: `baseline_requirements_met()` blocks `clock_in()` until
  every `is_baseline` pre-deployment document is `approved`.
- **Automated hour engine**: `apply_dtr_hours()` (BEFORE trigger) computes
  rendered hours on approval, subtracts a **1-hour lunch break when the shift
  exceeds 5 hours**, and adjusts `internships.hours_rendered` by delta
  (idempotent for re-approve/reject/edit/delete). Auto-completes the internship
  when `hours_rendered >= required_hours`.

### 4. Document workflow
State machine `pending → uploaded → under_review → approved | rejected`.
`documents.is_baseline = true` marks the pre-deployment files that gate
attendance. Mid-deployment = `journals` (tasks text + photo). Post-deployment =
`documents` with `phase = 'post_deployment'` (completion cert, portfolio).

## Client call examples

```js
// Clock in with GPS
const { data, error } = await supabase.rpc('clock_in', {
  p_internship_id: internshipId, p_lat: coords.latitude, p_lng: coords.longitude,
});

// Clock out
await supabase.rpc('clock_out', {
  p_internship_id: internshipId, p_lat: coords.latitude, p_lng: coords.longitude,
});

// Supervisor approves a DTR (drives the hour engine)
await supabase.rpc('approve_dtr', { p_dtr_id: dtrId, p_approve: true });
```

## Excel reporting
See `../reporting/README.md` for the `openpyxl` DTR export service.
