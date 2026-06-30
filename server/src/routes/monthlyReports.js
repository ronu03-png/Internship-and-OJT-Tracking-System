import { Router } from "express";
import db from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

function internIdsForSupervisor(supervisorId) {
  return db.prepare("SELECT id FROM users WHERE supervisor_id = ?").all(supervisorId).map((r) => r.id);
}

router.post("/", authRequired, requireRole("intern"), (req, res) => {
  const { month, summary, hours_rendered, performance, learning_outcomes } = req.body || {};
  if (!month || !summary) return res.status(400).json({ error: "Month and summary are required" });
  const info = db
    .prepare(
      `INSERT INTO monthly_reports (intern_id, month, summary, hours_rendered, performance, learning_outcomes)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(req.user.id, month, summary, hours_rendered || 0, performance || null, learning_outcomes || null);
  res.status(201).json(db.prepare("SELECT * FROM monthly_reports WHERE id = ?").get(info.lastInsertRowid));
});

router.get("/", authRequired, (req, res) => {
  if (req.user.role === "intern") {
    return res.json(db.prepare("SELECT * FROM monthly_reports WHERE intern_id = ? ORDER BY month DESC").all(req.user.id));
  }
  const ids = internIdsForSupervisor(req.user.id);
  if (ids.length === 0) return res.json([]);
  const placeholders = ids.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT r.*, u.full_name AS intern_name FROM monthly_reports r
       JOIN users u ON u.id = r.intern_id
       WHERE r.intern_id IN (${placeholders})
       ORDER BY r.month DESC`
    )
    .all(...ids);
  res.json(rows);
});

router.patch("/:id/review", authRequired, requireRole("supervisor", "coordinator"), (req, res) => {
  const { status, supervisor_remarks } = req.body || {};
  if (!["pending", "approved", "needs_revision"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const row = db.prepare("SELECT * FROM monthly_reports WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Report not found" });
  const ids = internIdsForSupervisor(req.user.id);
  if (req.user.role === "supervisor" && !ids.includes(row.intern_id)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  db.prepare("UPDATE monthly_reports SET status = ?, supervisor_remarks = ? WHERE id = ?").run(
    status, supervisor_remarks ?? null, row.id
  );
  res.json(db.prepare("SELECT * FROM monthly_reports WHERE id = ?").get(row.id));
});

router.delete("/:id", authRequired, requireRole("intern"), (req, res) => {
  const row = db.prepare("SELECT * FROM monthly_reports WHERE id = ?").get(req.params.id);
  if (!row || row.intern_id !== req.user.id) return res.status(404).json({ error: "Report not found" });
  db.prepare("DELETE FROM monthly_reports WHERE id = ?").run(row.id);
  res.json({ ok: true });
});

export default router;
