import { Router } from "express";
import db from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

const openingWithMeta = (id, viewerId) => {
  const row = db
    .prepare(
      `SELECT o.*, u.full_name AS supervisor_name
       FROM openings o JOIN users u ON u.id = o.supervisor_id
       WHERE o.id = ?`
    )
    .get(id);
  if (!row) return null;
  row.applicant_count = db
    .prepare("SELECT COUNT(*) AS n FROM applications WHERE opening_id = ?")
    .get(id).n;
  if (viewerId) {
    const app = db
      .prepare("SELECT status FROM applications WHERE opening_id = ? AND student_id = ?")
      .get(id, viewerId);
    row.my_application = app ? app.status : null;
  }
  return row;
};

// List openings.
// Supervisor: their own postings. Student: all open postings.
router.get("/", authRequired, (req, res) => {
  if (req.user.role === "supervisor") {
    const rows = db
      .prepare("SELECT * FROM openings WHERE supervisor_id = ? ORDER BY id DESC")
      .all(req.user.id);
    const withCounts = rows.map((o) => ({
      ...o,
      applicant_count: db
        .prepare("SELECT COUNT(*) AS n FROM applications WHERE opening_id = ?")
        .get(o.id).n,
    }));
    return res.json(withCounts);
  }
  const rows = db
    .prepare(
      `SELECT o.*, u.full_name AS supervisor_name
       FROM openings o JOIN users u ON u.id = o.supervisor_id
       WHERE o.status = 'open'
       ORDER BY o.id DESC`
    )
    .all();
  const result = rows.map((o) => {
    const app = db
      .prepare("SELECT status FROM applications WHERE opening_id = ? AND student_id = ?")
      .get(o.id, req.user.id);
    return { ...o, my_application: app ? app.status : null };
  });
  res.json(result);
});

// Supervisor creates an opening.
router.post("/", authRequired, requireRole("supervisor"), (req, res) => {
  const {
    title,
    department,
    course,
    location,
    slots,
    description,
    contact_email,
    contact_phone,
  } = req.body || {};
  if (!title) return res.status(400).json({ error: "Title is required" });
  const me = db.prepare("SELECT company_name, email FROM users WHERE id = ?").get(req.user.id);
  const info = db
    .prepare(
      `INSERT INTO openings
        (supervisor_id, title, company_name, department, course, location, slots, description, contact_email, contact_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.user.id,
      title,
      me?.company_name || null,
      department || null,
      course || null,
      location || null,
      Number(slots) || 1,
      description || null,
      contact_email || me?.email || null,
      contact_phone || null
    );
  res.status(201).json(openingWithMeta(info.lastInsertRowid));
});

// Supervisor edits an opening.
router.put("/:id", authRequired, requireRole("supervisor"), (req, res) => {
  const row = db.prepare("SELECT * FROM openings WHERE id = ?").get(req.params.id);
  if (!row || row.supervisor_id !== req.user.id) {
    return res.status(404).json({ error: "Opening not found" });
  }
  const f = req.body || {};
  db.prepare(
    `UPDATE openings SET title = ?, department = ?, course = ?, location = ?,
       slots = ?, description = ?, contact_email = ?, contact_phone = ? WHERE id = ?`
  ).run(
    f.title ?? row.title,
    f.department ?? row.department,
    f.course ?? row.course,
    f.location ?? row.location,
    f.slots != null ? Number(f.slots) || 1 : row.slots,
    f.description ?? row.description,
    f.contact_email ?? row.contact_email,
    f.contact_phone ?? row.contact_phone,
    row.id
  );
  res.json(openingWithMeta(row.id));
});

// Supervisor toggles open/closed.
router.patch("/:id/status", authRequired, requireRole("supervisor"), (req, res) => {
  const { status } = req.body || {};
  if (!["open", "closed"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const row = db.prepare("SELECT * FROM openings WHERE id = ?").get(req.params.id);
  if (!row || row.supervisor_id !== req.user.id) {
    return res.status(404).json({ error: "Opening not found" });
  }
  db.prepare("UPDATE openings SET status = ? WHERE id = ?").run(status, row.id);
  res.json(openingWithMeta(row.id));
});

router.delete("/:id", authRequired, requireRole("supervisor"), (req, res) => {
  const row = db.prepare("SELECT * FROM openings WHERE id = ?").get(req.params.id);
  if (!row || row.supervisor_id !== req.user.id) {
    return res.status(404).json({ error: "Opening not found" });
  }
  db.prepare("DELETE FROM openings WHERE id = ?").run(row.id);
  res.json({ ok: true });
});

// Student applies / expresses interest in an opening.
router.post("/:id/apply", authRequired, requireRole("intern"), (req, res) => {
  const opening = db.prepare("SELECT * FROM openings WHERE id = ?").get(req.params.id);
  if (!opening || opening.status !== "open") {
    return res.status(404).json({ error: "Opening not available" });
  }
  try {
    db.prepare(
      "INSERT INTO applications (opening_id, student_id, message) VALUES (?, ?, ?)"
    ).run(opening.id, req.user.id, (req.body?.message || "").trim() || null);
  } catch {
    return res.status(409).json({ error: "You already applied to this opening" });
  }
  res.status(201).json(openingWithMeta(opening.id, req.user.id));
});

// Student withdraws an application.
router.delete("/:id/apply", authRequired, requireRole("intern"), (req, res) => {
  db.prepare("DELETE FROM applications WHERE opening_id = ? AND student_id = ?").run(
    req.params.id,
    req.user.id
  );
  res.json(openingWithMeta(Number(req.params.id), req.user.id));
});

// Student: list of their own applications.
router.get("/my/applications", authRequired, requireRole("intern"), (req, res) => {
  const rows = db
    .prepare(
      `SELECT a.*, o.title, o.company_name, o.location, o.contact_email, o.contact_phone, o.status AS opening_status
       FROM applications a JOIN openings o ON o.id = a.opening_id
       WHERE a.student_id = ?
       ORDER BY a.id DESC`
    )
    .all(req.user.id);
  res.json(rows);
});

// Supervisor: applicants for one of their openings.
router.get("/:id/applications", authRequired, requireRole("supervisor"), (req, res) => {
  const opening = db.prepare("SELECT * FROM openings WHERE id = ?").get(req.params.id);
  if (!opening || opening.supervisor_id !== req.user.id) {
    return res.status(404).json({ error: "Opening not found" });
  }
  const rows = db
    .prepare(
      `SELECT a.*, u.full_name AS student_name, u.email AS student_email,
              u.course AS student_course, u.department AS student_department
       FROM applications a JOIN users u ON u.id = a.student_id
       WHERE a.opening_id = ?
       ORDER BY a.id DESC`
    )
    .all(opening.id);
  res.json(rows);
});

// Supervisor: accept / decline an application.
router.patch("/applications/:appId", authRequired, requireRole("supervisor"), (req, res) => {
  const { status } = req.body || {};
  if (!["accepted", "declined", "pending"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const app = db
    .prepare(
      `SELECT a.*, o.supervisor_id FROM applications a
       JOIN openings o ON o.id = a.opening_id WHERE a.id = ?`
    )
    .get(req.params.appId);
  if (!app || app.supervisor_id !== req.user.id) {
    return res.status(404).json({ error: "Application not found" });
  }
  db.prepare("UPDATE applications SET status = ? WHERE id = ?").run(status, app.id);
  // Accepting an applicant links the student to this supervisor so they become
  // a tracked intern (attendance, reports, requirements, messaging).
  if (status === "accepted") {
    db.prepare("UPDATE users SET supervisor_id = ? WHERE id = ? AND role = 'intern'").run(
      req.user.id,
      app.student_id
    );
  }
  res.json({ ok: true });
});

export default router;
