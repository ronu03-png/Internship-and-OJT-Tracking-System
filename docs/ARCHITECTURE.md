# Internship & OJT Tracking System — Architecture & Development Roadmap

A CHED-aligned system to digitize the end-to-end OJT process for a Philippine
HEI, covering three roles: **Student/Intern**, **HTE/School Supervisor**, and
**Administrator**.

> This repository ships **two** backends:
> 1. **Live app** — Node/Express + SQLite + React (currently deployed). Fully
>    working today; DTR now supports server-timestamped, GPS-verified,
>    requirement-locked clock in/out.
> 2. **Reference target** — Supabase/PostgreSQL SQL + Python `openpyxl`
>    reporting (see `/supabase` and `/reporting`) for a scalable production
>    deployment with RLS.
>
> The schema and endpoints below document the **target production design**; the
> live app implements a pragmatic subset of the same model.

---

## 1. Database Schema (target: PostgreSQL)

### Roles enum
```
user_role       : student | supervisor | admin      (admin == OJT Supervisor)
document_status : pending | uploaded | under_review | approved | rejected
document_phase  : pre_deployment | mid_deployment | post_deployment
dtr_status      : open | pending_approval | approved | rejected
internship_status : pending | active | completed | terminated
```

### Core tables & relationships

| Table | Key columns | Relationships |
|-------|-------------|---------------|
| `profiles` | `id (uuid, PK→auth.users)`, `email`, `full_name`, `user_role`, `hte_id`, `is_active` | `hte_id → htes.id` (supervisors) |
| `htes` | `id (uuid)`, `name`, `address`, `geofence_lat/lng`, `geofence_radius_m` | — |
| `internships` | `id`, `student_id`, `hte_id`, `supervisor_id`, `required_hours`, `hours_rendered`, `status`, `start_date`, `end_date` | `student_id → profiles`, `hte_id → htes`, `supervisor_id → profiles` |
| `dtr_logs` | `id`, `internship_id`, `student_id`, `log_date`, `time_in/out (timestamptz)`, `*_lat/lng`, `rendered_hours`, `status`, `approved_by` | `internship_id → internships`, `student_id → profiles` |
| `documents` | `id`, `internship_id`, `student_id`, `phase`, `doc_type`, `status`, `storage_path`, `is_baseline`, `reviewed_by` | `internship_id → internships` |
| `journals` | `id`, `internship_id`, `student_id`, `week_no`, `tasks_completed`, `photo_path`, `status` | `internship_id → internships` |
| `evaluations` | `id`, `internship_id`, `supervisor_id`, rubric scores, `overall_rating`, `comments` | `internship_id → internships` |

### Design notes (no redundancy, accurate hours)
- **Hours are computed once** on DTR approval and stored on the `dtr_logs`
  row; `internships.hours_rendered` is a **maintained aggregate** updated by a
  trigger using **deltas** (idempotent across re-approve/reject/edit/delete).
- **Student ↔ Supervisor link** flows through `internships` (single source of
  truth) rather than duplicated foreign keys everywhere.
- **Geofencing**: `htes.geofence_lat/lng/radius_m` + per-punch GPS on
  `dtr_logs` enables server-side distance checks.

Full DDL: `supabase/migrations/01..05_*.sql`.

---

## 2. Core API Endpoints

### Auth
| Method | Path | Role | Purpose |
|--------|------|------|---------|
| POST | `/auth/login` | public | Email/password → JWT |
| GET | `/auth/me` | any | Current profile |
| POST | `/auth/register` | admin | Create account (admin-only) |
| GET | `/auth/users` | admin | List all users |

### Pre-deployment (documents / requirements)
| Method | Path | Role | Purpose |
|--------|------|------|---------|
| POST | `/requirements` | student | Upload a requirement (resume, medical, consent, endorsement) |
| GET | `/requirements` | student/supervisor/admin | List (scoped) |
| PATCH | `/requirements/:id/review` | supervisor/admin | Approve / reject |

### Mid-deployment (DTR + journals)
| Method | Path | Role | Purpose |
|--------|------|------|---------|
| GET | `/attendance/eligibility` | student | Lock state + today's session + server time |
| POST | `/attendance/clock-in` | student | **Server-stamped** clock-in + GPS |
| POST | `/attendance/clock-out` | student | **Server-stamped** clock-out + GPS + hours |
| POST | `/attendance` | student | Manual day log (fallback) |
| GET | `/attendance` | student/supervisor | List (scoped) |
| PATCH | `/attendance/:id/status` | supervisor | Approve / reject DTR |
| POST/GET | `/journals` | student | Weekly narrative + photo |
| PATCH | `/journals/:id/review` | supervisor | Verify journal |

### Post-deployment
| Method | Path | Role | Purpose |
|--------|------|------|---------|
| POST | `/evaluations` | supervisor/admin | Standardized performance rubric |
| POST/GET | `/final-reports` | student/supervisor | Narrative report + COC |
| GET | `/stats/admin` | admin | Compliance overview |
| (script) | `reporting/dtr_report.py` | admin | Export registrar-ready DTR `.xlsx` |

### Supabase RPCs (target)
`clock_in(internship_id, lat, lng)`, `clock_out(internship_id, lat, lng)`,
`approve_dtr(dtr_id, approve, remarks)`, `baseline_requirements_met(internship_id)`.

---

## 3. Suggested Technology Stack

### Recommended production stack
| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | **Next.js (React)** + Tailwind CSS | SSR/SEO for landing, mobile-responsive PWA for clock-in |
| Mobile capture | Browser Geolocation API / PWA | Students clock in from phones; installable |
| Backend/API | **Supabase** (PostgREST) + optional **FastAPI** microservice | Instant REST + RLS; FastAPI for heavy jobs (reports) |
| Database | **PostgreSQL** (via Supabase) | Triggers, RLS, PL/pgSQL hour engine |
| Auth | **Supabase Auth** (JWT) | Role metadata → `profiles` via trigger |
| Storage | **Supabase Storage** | Documents + journal photos, RLS by owner path |
| Reporting | **Python + openpyxl + psycopg2** | Registrar-ready Excel with signatures |
| Security | RLS, HTTPS, server-side timestamps, geofencing | Anti-tampering + least privilege |
| Hosting | Vercel (Next.js) + Supabase (DB/Auth/Storage) | Scalable, managed |

### Current live stack (this repo)
| Layer | Choice |
|-------|--------|
| Frontend | React (Vite) + Tailwind + lucide-react |
| Backend | Node.js + Express |
| Database | SQLite (`better-sqlite3`), `DATABASE_PATH` configurable |
| Auth | Custom JWT (`/auth/*`) |
| Hosting | Netlify (client) + Render (server, persistent disk) |

**Migration path:** the `/supabase` SQL is the drop-in target schema; swap the
Express data layer for the Supabase client, move JWT to Supabase Auth, and point
`reporting/dtr_report.py` at the Postgres connection string.

---

## 4. Phase-based feature status (live app)

| Phase | Feature | Status |
|-------|---------|--------|
| Pre | Requirements upload + review, requirement-locked attendance | Implemented |
| Mid | **Server-timestamped, GPS DTR clock in/out**, journals, weekly/monthly reports, supervisor approval | Implemented |
| Post | Evaluations rubric, final reports, certificates repository | Implemented |
| Admin | User management, MOA field on companies, stats, audit logs | Implemented |
| Reporting | openpyxl DTR export | Provided (Supabase target) |
