import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database location is configurable so it can live on a persistent disk in
// production (e.g. Render's mounted disk). Defaults to server/data.sqlite locally.
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "..", "data.sqlite");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name     TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL CHECK (role IN ('admin','supervisor','intern')),
    company_name  TEXT,
    position      TEXT,
    department    TEXT,
    course        TEXT,
    phone         TEXT,
    address       TEXT,
    gender        TEXT,
    birthdate     TEXT,
    student_id    TEXT,
    required_hours INTEGER DEFAULT 0,
    approved_hours INTEGER DEFAULT 0,
    supervisor_id INTEGER REFERENCES users(id),
    company_id    INTEGER REFERENCES companies(id),
    status        TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','completed')),
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    intern_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date       TEXT NOT NULL,
    time_in    TEXT,
    time_out   TEXT,
    hours      REAL NOT NULL DEFAULT 0,
    status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','present','late','absent')),
    remarks    TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reports (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    intern_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    week_number INTEGER,
    content     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','needs_revision')),
    feedback    TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body         TEXT NOT NULL,
    read_at      TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- OJT openings posted by company supervisors so students can find work
  -- and contact companies directly.
  CREATE TABLE IF NOT EXISTS openings (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    supervisor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    company_name  TEXT,
    department    TEXT,
    course        TEXT,
    location      TEXT,
    slots         INTEGER NOT NULL DEFAULT 1,
    description   TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Student applications / expressions of interest to an opening.
  CREATE TABLE IF NOT EXISTS applications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    opening_id  INTEGER NOT NULL REFERENCES openings(id) ON DELETE CASCADE,
    student_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message     TEXT,
    status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (opening_id, student_id)
  );

  -- OJT requirements / documents each student must submit (MOA, medical,
  -- parent consent, endorsement letter, etc.), reviewed by the supervisor.
  CREATE TABLE IF NOT EXISTS requirements (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    intern_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    link        TEXT,
    note        TEXT,
    status      TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','approved','rejected','pending')),
    feedback    TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Companies / city offices that accept OJT students.
  CREATE TABLE IF NOT EXISTS companies (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    logo_url        TEXT,
    address         TEXT,
    industry        TEXT,
    email           TEXT,
    phone           TEXT,
    website         TEXT,
    supervisor_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    department      TEXT,
    description     TEXT,
    available_slots INTEGER DEFAULT 0,
    status          TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
    moa_file_url    TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Internship placements linking students to companies/supervisors.
  CREATE TABLE IF NOT EXISTS internship_placements (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id       INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    supervisor_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status           TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','completed')),
    start_date       TEXT,
    end_date         TEXT,
    assignment_letter_url TEXT,
    created_at       TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Daily journals / daily time record entries.
  CREATE TABLE IF NOT EXISTS daily_journals (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    intern_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date            TEXT NOT NULL,
    accomplishments TEXT NOT NULL,
    skills_learned  TEXT,
    photo_urls      TEXT,
    file_urls       TEXT,
    status          TEXT DEFAULT 'submitted' CHECK (status IN ('submitted','approved','rejected','pending')),
    supervisor_feedback TEXT,
    supervisor_notes   TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Weekly reports (separate from the generic narrative reports).
  CREATE TABLE IF NOT EXISTS weekly_reports (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    intern_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_number     INTEGER NOT NULL,
    title           TEXT,
    accomplishments TEXT,
    reflection      TEXT,
    problems        TEXT,
    solutions       TEXT,
    file_urls       TEXT,
    status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','needs_revision')),
    supervisor_comments TEXT,
    supervisor_notes   TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Monthly reports.
  CREATE TABLE IF NOT EXISTS monthly_reports (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    intern_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month           TEXT NOT NULL,
    summary         TEXT,
    hours_rendered  REAL DEFAULT 0,
    performance     TEXT,
    learning_outcomes TEXT,
    supervisor_remarks TEXT,
    status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','needs_revision')),
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Final reports / completion documents.
  CREATE TABLE IF NOT EXISTS final_reports (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    intern_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    narrative_report   TEXT,
    terminal_report    TEXT,
    presentation_url   TEXT,
    final_documentation_url TEXT,
    completion_form_url TEXT,
    certificate_url    TEXT,
    status             TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    created_at         TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Performance evaluations by supervisors.
  CREATE TABLE IF NOT EXISTS evaluations (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    intern_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    supervisor_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attendance        INTEGER DEFAULT 0,
    punctuality       INTEGER DEFAULT 0,
    communication     INTEGER DEFAULT 0,
    technical_skills  INTEGER DEFAULT 0,
    professionalism   INTEGER DEFAULT 0,
    initiative        INTEGER DEFAULT 0,
    productivity      INTEGER DEFAULT 0,
    adaptability      INTEGER DEFAULT 0,
    teamwork          INTEGER DEFAULT 0,
    leadership        INTEGER DEFAULT 0,
    problem_solving   INTEGER DEFAULT 0,
    overall_rating    INTEGER DEFAULT 0,
    comments          TEXT,
    created_at        TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Announcements posted by admins/coordinators.
  CREATE TABLE IF NOT EXISTS announcements (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL,
    author_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pinned      INTEGER DEFAULT 0,
    attachment_url TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Notifications for users.
  CREATE TABLE IF NOT EXISTS notifications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        TEXT,
    title       TEXT NOT NULL,
    message     TEXT NOT NULL,
    read_at     TEXT,
    related_id  INTEGER,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Calendar events.
  CREATE TABLE IF NOT EXISTS calendar_events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    type        TEXT,
    start_date  TEXT NOT NULL,
    end_date    TEXT,
    description TEXT,
    created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Audit trail.
  CREATE TABLE IF NOT EXISTS audit_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,
    entity      TEXT,
    entity_id   INTEGER,
    details     TEXT,
    ip_address  TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- System settings.
  CREATE TABLE IF NOT EXISTS settings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    key         TEXT NOT NULL UNIQUE,
    value       TEXT,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Academic years / semesters.
  CREATE TABLE IF NOT EXISTS academic_years (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    year        TEXT NOT NULL,
    semester    TEXT,
    start_date  TEXT,
    end_date    TEXT,
    is_active   INTEGER DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Uploaded files metadata.
  CREATE TABLE IF NOT EXISTS files (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    filename      TEXT NOT NULL,
    original_name TEXT,
    mime_type     TEXT,
    size          INTEGER,
    path          TEXT,
    uploaded_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// --- Lightweight migrations for databases created before new columns existed.
function ensureColumn(table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

ensureColumn("users", "department", "TEXT");
ensureColumn("users", "course", "TEXT");
ensureColumn("users", "phone", "TEXT");
ensureColumn("users", "address", "TEXT");
ensureColumn("users", "gender", "TEXT");
ensureColumn("users", "birthdate", "TEXT");
ensureColumn("users", "student_id", "TEXT");
ensureColumn("users", "employee_id", "TEXT");
ensureColumn("users", "year_level", "TEXT");
ensureColumn("users", "section", "TEXT");
ensureColumn("users", "institution", "TEXT");
ensureColumn("users", "username", "TEXT");
ensureColumn("users", "security_question", "TEXT");
ensureColumn("users", "company_id", "INTEGER REFERENCES companies(id)");
ensureColumn("users", "approved_hours", "INTEGER DEFAULT 0");
ensureColumn("users", "status", "TEXT DEFAULT 'active'");
ensureColumn("daily_journals", "skills_learned", "TEXT");

// Geofencing / anti-tampering columns for DTR clock in/out.
ensureColumn("attendance", "time_in_lat", "REAL");
ensureColumn("attendance", "time_in_lng", "REAL");
ensureColumn("attendance", "time_out_lat", "REAL");
ensureColumn("attendance", "time_out_lng", "REAL");
// 'manual' = student typed the times; 'device' = server-stamped clock in/out.
ensureColumn("attendance", "source", "TEXT DEFAULT 'manual'");

// --- Migration: convert legacy coordinator accounts to supervisor accounts.
function convertCoordinatorsToSupervisors() {
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  if (!tableInfo.some((c) => c.name === "role")) return;
  const result = db.prepare("UPDATE users SET role = 'supervisor' WHERE role = 'coordinator'").run();
  if (result.changes > 0) {
    console.log(`Migrated ${result.changes} coordinator account(s) to supervisor.`);
  }
}
convertCoordinatorsToSupervisors();

// --- Migration: remove coordinator-specific columns after role merge.
function removeCoordinatorColumns() {
  try {
    const placementsCols = db.prepare("PRAGMA table_info(internship_placements)").all();
    if (placementsCols.some((c) => c.name === "coordinator_id")) {
      db.exec("ALTER TABLE internship_placements DROP COLUMN coordinator_id");
      console.log("Removed coordinator_id column from internship_placements.");
    }
  } catch (err) {
    console.log("Could not drop coordinator_id column:", err.message);
  }

  try {
    const journalsCols = db.prepare("PRAGMA table_info(daily_journals)").all();
    if (journalsCols.some((c) => c.name === "coordinator_notes")) {
      db.exec("ALTER TABLE daily_journals RENAME COLUMN coordinator_notes TO supervisor_notes");
      console.log("Renamed coordinator_notes to supervisor_notes in daily_journals.");
    }
  } catch (err) {
    console.log("Could not rename daily_journals coordinator_notes:", err.message);
  }

  try {
    const weeklyCols = db.prepare("PRAGMA table_info(weekly_reports)").all();
    if (weeklyCols.some((c) => c.name === "coordinator_notes")) {
      db.exec("ALTER TABLE weekly_reports RENAME COLUMN coordinator_notes TO supervisor_notes");
      console.log("Renamed coordinator_notes to supervisor_notes in weekly_reports.");
    }
  } catch (err) {
    console.log("Could not rename weekly_reports coordinator_notes:", err.message);
  }
}
removeCoordinatorColumns();

// --- Migration for old role constraint (intern/supervisor only) to new 3-role set.
function migrateUserRoles() {
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  if (!tableInfo.some((c) => c.name === "role")) return;

  // Try to insert a role that would only be allowed in the new schema.
  // If it fails, the old constraint is still in place and we must recreate the table.
  try {
    db.prepare("INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)")
      .run("__migr_tmp", "__migr_tmp@localhost", "tmp", "admin");
    const tmp = db.prepare("SELECT id FROM users WHERE email = ?").get("__migr_tmp@localhost");
    db.prepare("DELETE FROM users WHERE id = ?").run(tmp.id);
    return; // new constraint already active
  } catch {
    // Old constraint present; recreate table to expand roles.
  }

  db.pragma("foreign_keys = OFF");
  db.transaction(() => {
    db.exec(`
      CREATE TABLE users_new (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name     TEXT NOT NULL,
        email         TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role          TEXT NOT NULL CHECK (role IN ('admin','supervisor','intern')),
        company_name  TEXT,
        position      TEXT,
        department    TEXT,
        course        TEXT,
        phone         TEXT,
        address       TEXT,
        gender        TEXT,
        birthdate     TEXT,
        required_hours INTEGER DEFAULT 0,
        supervisor_id INTEGER REFERENCES users_new(id),
        company_id    INTEGER REFERENCES companies(id),
        status        TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
        created_at    TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
    db.exec(`
      INSERT INTO users_new (id, full_name, email, password_hash, role, company_name, position, department, course, required_hours, supervisor_id, created_at)
      SELECT id, full_name, email, password_hash, role, company_name, position, department, course, required_hours, supervisor_id, created_at
      FROM users;
    `);
    db.exec("DROP TABLE users;");
    db.exec("ALTER TABLE users_new RENAME TO users;");
  })();
  db.pragma("foreign_keys = ON");
}

migrateUserRoles();

// Seed a default admin account so the system is usable immediately after first start.
function seedAdmin() {
  const count = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
  if (count === 0) {
    const hash = bcrypt.hashSync("admin123", 10);
    db.prepare(
      "INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)"
    ).run("System Administrator", "admin@interntrack.local", hash, "admin");
    console.log("Default admin created: admin@interntrack.local / admin123");
  }
}
seedAdmin();

export default db;
