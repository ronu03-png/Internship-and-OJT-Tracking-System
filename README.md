# OJT InternTrack

A full-stack internship and OJT placement tracking system for universities, coordinators, company supervisors, and student interns.

## Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + React Router
- **Backend**: Node.js + Express
- **Database**: SQLite via `better-sqlite3`
- **Auth**: JWT + bcrypt

## Requirements

- Node.js 18+
- npm

## Quick start

Install all dependencies:

```bash
npm run install:all
```

Seed the database with demo accounts and data:

```bash
npm run seed
```

Run the full stack (server + client):

```bash
npm run dev
```

- API: http://localhost:4000
- Client: http://localhost:5173

## Production build

```bash
npm run build
```

## Demo accounts (after seeding)

| Role            | Email                         | Password |
|-----------------|-------------------------------|----------|
| Admin           | admin@interntrack.local       | admin123 |
| Coordinator     | coordinator1@demo.com         | demo123  |
| Supervisor      | supervisor1@demo.com          | demo123  |
| Intern / Student| student1@demo.com               | demo123  |

For the full list of seeded users, run:

```bash
node -e "import('./server/src/db.js').then(({default: db}) => console.log(db.prepare('SELECT full_name, email, role FROM users').all()))"
```

## Project structure

```
.
├── client/          # React frontend
├── server/          # Express API and SQLite database
│   ├── src/
│   │   ├── db.js           # Database schema & connection
│   │   ├── index.js        # Express server entry
│   │   └── routes/         # API route modules
│   └── scripts/
│       └── seed-production.js  # Demo data seeder
├── package.json     # Root scripts to run both apps
└── README.md
```

## Database

The SQLite file `server/data.sqlite` is created automatically on first server start. Schema migrations and default admin seeding are handled in `server/src/db.js`. The path is configurable via the `DATABASE_PATH` environment variable so it can live on a persistent disk in production.

## Deploy online (Render + Netlify)

The app is split into a backend API (Render) and a frontend (Netlify). It is **private by default** — every page requires JWT login.

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<you>/interntrack.git
git push -u origin main
```

### 2. Deploy the backend on Render

1. Go to https://render.com → **New → Blueprint** and select your repo. Render reads `render.yaml`.
2. It creates a Web Service `interntrack-api` with:
   - `JWT_SECRET` — auto-generated.
   - `DATABASE_PATH=/var/data/data.sqlite` — on a 1 GB persistent disk.
   - `CLIENT_ORIGIN` — set this **after** step 3 to your Netlify URL.
3. After the first deploy, open the Render **Shell** and seed demo data:
   ```bash
   npm run seed
   ```
   (or use the root `node scripts/seed-production.js` from the `server` dir.)
4. Copy the live API URL, e.g. `https://interntrack-api.onrender.com`.

> **Free plan note:** persistent disks require a paid instance (`starter`). On the
> free plan, set `plan: free`, remove the `disk` block and `DATABASE_PATH` from
> `render.yaml`; the database resets on each deploy, so re-run `npm run seed`.

### 3. Deploy the frontend on Netlify

1. Go to https://netlify.com → **Add new site → Import from Git** and select your repo. Netlify reads `netlify.toml`.
2. In **Site settings → Environment variables**, add:
   ```
   VITE_API_URL = https://interntrack-api.onrender.com/api
   ```
3. Deploy. Copy your Netlify URL, e.g. `https://your-site.netlify.app`.

### 4. Lock CORS to your frontend

Back in Render, set the `CLIENT_ORIGIN` env var to your Netlify URL
(`https://your-site.netlify.app`) and redeploy. This restricts the API to only
accept requests from your site.

### Environment variables summary

| Service | Variable | Example |
|---|---|---|
| Render (backend) | `JWT_SECRET` | auto-generated |
| Render (backend) | `DATABASE_PATH` | `/var/data/data.sqlite` |
| Render (backend) | `CLIENT_ORIGIN` | `https://your-site.netlify.app` |
| Render (backend) | `PORT` | `4000` |
| Netlify (frontend) | `VITE_API_URL` | `https://interntrack-api.onrender.com/api` |

## License

For academic / capstone use only.
