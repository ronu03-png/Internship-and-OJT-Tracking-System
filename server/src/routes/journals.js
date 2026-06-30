import { Router } from "express";
import db from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

function internIdsForSupervisor(supervisorId) {
  return db
    .prepare("SELECT id FROM users WHERE supervisor_id = ?")
    .all(supervisorId)
    .map((r) => r.id);
}

// Student submits daily journal
router.post("/", authRequired, requireRole("intern"), (req, res) => {
  const { date, accomplishments, photo_urls, file_urls } = req.body || {};
  if (!date || !accomplishments) {
    return res.status(400).json({ error: "Date and accomplishments are required" });
  }
  const info = db
    .prepare(
      "INSERT INTO daily_journals (intern_id, date, accomplishments, photo_urls, file_urls) VALUES (?, ?, ?, ?, ?)"
    )
    .run(req.user.id, date, accomplishments, JSON.stringify(photo_urls || []), JSON.stringify(file_urls || []));
  res.status(201).json(db.prepare("SELECT * FROM daily_journals WHERE id = ?").get(info.lastInsertRowid));
});

// List journals
router.get("/", authRequired, (req, res) => {
  if (req.user.role === "intern") {
    return res.json(
      db.prepare("SELECT * FROM daily_journals WHERE intern_id = ? ORDER BY date DESC, id DESC").all(req.user.id)
    );
  }
  const ids = internIdsForSupervisor(req.user.id);
  if (ids.length === 0) return res.json([]);
  const placeholders = ids.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT j.*, u.full_name AS intern_name FROM daily_journals j
       JOIN users u ON u.id = j.intern_id
       WHERE j.intern_id IN (${placeholders})
       ORDER BY j.date DESC, j.id DESC`
    )
    .all(...ids);
  res.json(rows);
});

// Supervisor reviews a journal
router.patch("/:id/review", authRequired, requireRole("supervisor"), (req, res) => {
  const { status, feedback, coordinator_notes } = req.body || {};
  if (!["submitted", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const row = db.prepare("SELECT * FROM daily_journals WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Journal not found" });
  const ids = internIdsForSupervisor(req.user.id);
  if (req.user.role === "supervisor" && !ids.includes(row.intern_id)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  db.prepare(
    "UPDATE daily_journals SET status = ?, supervisor_feedback = ?, coordinator_notes = ? WHERE id = ?"
  ).run(status, feedback ?? null, coordinator_notes ?? null, row.id);
  res.json(db.prepare("SELECT * FROM daily_journals WHERE id = ?").get(row.id));
});

router.delete("/:id", authRequired, requireRole("intern"), (req, res) => {
  const row = db.prepare("SELECT * FROM daily_journals WHERE id = ?").get(req.params.id);
  if (!row || row.intern_id !== req.user.id) {
    return res.status(404).json({ error: "Journal not found" });
  }
  db.prepare("DELETE FROM daily_journals WHERE id = ?").run(row.id);
  res.json({ ok: true });
});

export default router;
