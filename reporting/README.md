# DTR Excel Reporting Service

Generates a registrar-ready `.xlsx` Daily Time Record from **approved** DTR data
in the Supabase/PostgreSQL database, using `psycopg2` + `openpyxl`.

## Features
- Institution header + student/HTE metadata block
- Bordered table with bold blue headers and zebra striping
- `Time In` / `Time Out` formatted, `Rendered Hours` as `0.00`
- Automatic **TOTAL APPROVED HOURS** row
- Signature slots for **Student** and **HTE Supervisor** (signature over printed
  name / date) for university registrar audits
- Pulls only `status = 'approved'` rows (audit-eligible)

## Setup

```bash
cd reporting
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # then edit DATABASE_URL
```

Set the connection string in `.env` (or export it). The script reads
`DATABASE_URL` first, then falls back to `PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD`.

> Tip: the script uses `os.getenv`. To auto-load `.env`, either export the vars
> in your shell, or `pip install python-dotenv` and add
> `from dotenv import load_dotenv; load_dotenv()` at the top of `dtr_report.py`.

## Usage

```bash
python dtr_report.py --internship 3f9a2b6c-1e4d-4a77-9b0c-2d5e8f1a6c34
# custom output path
python dtr_report.py --internship <UUID> --out "DTR_JuanDelaCruz.xlsx"
```

The report is written to the given `--out` (default `DTR_<first8ofUUID>.xlsx`).

## How it maps to CHED CMO No. 104
- Uses the **approved** server-timestamped hours produced by the database hour
  engine (1-hour lunch deduction for >5h shifts already applied).
- Total hours let the supervisor verify the CMO minimum (default 486h).
- Dual signature slots satisfy physical/digital sign-off for registrar audits.

## Security notes
- Connect with a **least-privilege** database role for reporting where possible.
- Never commit `.env` (it holds DB credentials) — it is gitignored.
- If you prefer not to use direct DB access, swap `fetch_*` for calls to the
  Supabase REST endpoint (`/rest/v1/dtr_logs?...`) with a service role key.
