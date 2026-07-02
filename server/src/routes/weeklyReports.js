import { Router } from "express";
import db from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

function internIdsForSupervisor(supervisorId) {
  return db.prepare("SELECT id FROM users WHERE supervisor_id = ?").all(supervisorId).map((r) => r.id);
}

router.post("/", authRequired, requireRole("intern"), (req, res) => {
  const { week_number, title, accomplishments, reflection, problems, solutions, file_urls } = req.body || {};
  if (!week_number || !accomplishments) {
    return res.status(400).json({ error: "Week number and accomplishments are required" });
  }
  const info = db
    .prepare(
      `INSERT INTO weekly_reports (intern_id, week_number, title, accomplishments, reflection, problems, solutions, file_urls)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.user.id,
      week_number,
      title || null,
      accomplishments,
      reflection || null,
      problems || null,
      solutions || null,
      JSON.stringify(file_urls || [])
    );
  res.status(201).json(db.prepare("SELECT * FROM weekly_reports WHERE id = ?").get(info.lastInsertRowid));
});

router.get("/", authRequired, (req, res) => {
  if (req.user.role === "intern") {
    return res.json(
      db.prepare("SELECT * FROM weekly_reports WHERE intern_id = ? ORDER BY week_number DESC").all(req.user.id)
    );
  }
  const ids = internIdsForSupervisor(req.user.id);
  if (ids.length === 0) return res.json([]);
  const placeholders = ids.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT r.*, u.full_name AS intern_name FROM weekly_reports r
       JOIN users u ON u.id = r.intern_id
       WHERE r.intern_id IN (${placeholders})
       ORDER BY r.week_number DESC`
    )
    .all(...ids);
  res.json(rows);
});

router.patch("/:id/review", authRequired, requireRole("supervisor"), (req, res) => {
  const { status, comments, supervisor_notes } = req.body || {};
  if (!["pending", "approved", "needs_revision"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const row = db.prepare("SELECT * FROM weekly_reports WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Report not found" });
  const ids = internIdsForSupervisor(req.user.id);
  if (req.user.role === "supervisor" && !ids.includes(row.intern_id)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  db.prepare(
    "UPDATE weekly_reports SET status = ?, supervisor_comments = ?, supervisor_notes = ? WHERE id = ?"
  ).run(status, comments ?? null, supervisor_notes ?? null, row.id);
  res.json(db.prepare("SELECT * FROM weekly_reports WHERE id = ?").get(row.id));
});

router.delete("/:id", authRequired, requireRole("intern"), (req, res) => {
  const row = db.prepare("SELECT * FROM weekly_reports WHERE id = ?").get(req.params.id);
  if (!row || row.intern_id !== req.user.id) {
    return res.status(404).json({ error: "Report not found" });
  }
  db.prepare("DELETE FROM weekly_reports WHERE id = ?").run(row.id);
  res.json({ ok: true });
});

export default router;
