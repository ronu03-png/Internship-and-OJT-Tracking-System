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

// Intern submits a narrative report.
router.post("/", authRequired, requireRole("intern"), (req, res) => {
  const { title, week_number, content } = req.body || {};
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }
  const info = db
    .prepare(
      `INSERT INTO reports (intern_id, title, week_number, content) VALUES (?, ?, ?, ?)`
    )
    .run(req.user.id, title, week_number || null, content);
  res.status(201).json(db.prepare("SELECT * FROM reports WHERE id = ?").get(info.lastInsertRowid));
});

// List reports. Intern: own. Supervisor: their interns'.
router.get("/", authRequired, (req, res) => {
  if (req.user.role === "intern") {
    return res.json(
      db.prepare("SELECT * FROM reports WHERE intern_id = ? ORDER BY id DESC").all(req.user.id)
    );
  }
  const ids = internIdsForSupervisor(req.user.id);
  if (ids.length === 0) return res.json([]);
  const placeholders = ids.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT r.*, u.full_name AS intern_name
       FROM reports r JOIN users u ON u.id = r.intern_id
       WHERE r.intern_id IN (${placeholders})
       ORDER BY r.id DESC`
    )
    .all(...ids);
  res.json(rows);
});

// Intern edits a report that still needs revision / is pending.
router.put("/:id", authRequired, requireRole("intern"), (req, res) => {
  const row = db.prepare("SELECT * FROM reports WHERE id = ?").get(req.params.id);
  if (!row || row.intern_id !== req.user.id) {
    return res.status(404).json({ error: "Report not found" });
  }
  const title = req.body.title ?? row.title;
  const week_number = req.body.week_number ?? row.week_number;
  const content = req.body.content ?? row.content;
  db.prepare(
    "UPDATE reports SET title = ?, week_number = ?, content = ?, status = 'pending' WHERE id = ?"
  ).run(title, week_number, content, row.id);
  res.json(db.prepare("SELECT * FROM reports WHERE id = ?").get(row.id));
});

// Supervisor reviews a report.
router.patch("/:id/review", authRequired, requireRole("supervisor"), (req, res) => {
  const { status, feedback } = req.body || {};
  if (!["approved", "needs_revision", "pending"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const row = db.prepare("SELECT * FROM reports WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Report not found" });
  const ids = internIdsForSupervisor(req.user.id);
  if (!ids.includes(row.intern_id)) return res.status(403).json({ error: "Forbidden" });
  db.prepare("UPDATE reports SET status = ?, feedback = ? WHERE id = ?").run(
    status,
    feedback ?? null,
    row.id
  );
  res.json(db.prepare("SELECT * FROM reports WHERE id = ?").get(row.id));
});

router.delete("/:id", authRequired, requireRole("intern"), (req, res) => {
  const row = db.prepare("SELECT * FROM reports WHERE id = ?").get(req.params.id);
  if (!row || row.intern_id !== req.user.id) {
    return res.status(404).json({ error: "Report not found" });
  }
  db.prepare("DELETE FROM reports WHERE id = ?").run(row.id);
  res.json({ ok: true });
});

export default router;
