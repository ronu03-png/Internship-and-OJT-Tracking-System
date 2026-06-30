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

// Student submits / uploads a requirement (document link).
router.post("/", authRequired, requireRole("intern"), (req, res) => {
  const { name, link, note } = req.body || {};
  if (!name) return res.status(400).json({ error: "Requirement name is required" });
  const info = db
    .prepare("INSERT INTO requirements (intern_id, name, link, note) VALUES (?, ?, ?, ?)")
    .run(req.user.id, name, link || null, note || null);
  res.status(201).json(db.prepare("SELECT * FROM requirements WHERE id = ?").get(info.lastInsertRowid));
});

// List requirements. Student: own. Supervisor: their interns'.
router.get("/", authRequired, (req, res) => {
  if (req.user.role === "intern") {
    return res.json(
      db.prepare("SELECT * FROM requirements WHERE intern_id = ? ORDER BY id DESC").all(req.user.id)
    );
  }
  const ids = internIdsForSupervisor(req.user.id);
  if (ids.length === 0) return res.json([]);
  const placeholders = ids.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT r.*, u.full_name AS intern_name
       FROM requirements r JOIN users u ON u.id = r.intern_id
       WHERE r.intern_id IN (${placeholders})
       ORDER BY r.id DESC`
    )
    .all(...ids);
  res.json(rows);
});

// Student edits / resubmits a requirement.
router.put("/:id", authRequired, requireRole("intern"), (req, res) => {
  const row = db.prepare("SELECT * FROM requirements WHERE id = ?").get(req.params.id);
  if (!row || row.intern_id !== req.user.id) {
    return res.status(404).json({ error: "Requirement not found" });
  }
  db.prepare(
    "UPDATE requirements SET name = ?, link = ?, note = ?, status = 'submitted' WHERE id = ?"
  ).run(
    req.body.name ?? row.name,
    req.body.link ?? row.link,
    req.body.note ?? row.note,
    row.id
  );
  res.json(db.prepare("SELECT * FROM requirements WHERE id = ?").get(row.id));
});

// Supervisor reviews a requirement.
router.patch("/:id/review", authRequired, requireRole("supervisor"), (req, res) => {
  const { status, feedback } = req.body || {};
  if (!["approved", "rejected", "submitted"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const row = db.prepare("SELECT * FROM requirements WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Requirement not found" });
  const ids = internIdsForSupervisor(req.user.id);
  if (!ids.includes(row.intern_id)) return res.status(403).json({ error: "Forbidden" });
  db.prepare("UPDATE requirements SET status = ?, feedback = ? WHERE id = ?").run(
    status,
    feedback ?? null,
    row.id
  );
  res.json(db.prepare("SELECT * FROM requirements WHERE id = ?").get(row.id));
});

router.delete("/:id", authRequired, requireRole("intern"), (req, res) => {
  const row = db.prepare("SELECT * FROM requirements WHERE id = ?").get(req.params.id);
  if (!row || row.intern_id !== req.user.id) {
    return res.status(404).json({ error: "Requirement not found" });
  }
  db.prepare("DELETE FROM requirements WHERE id = ?").run(row.id);
  res.json({ ok: true });
});

export default router;
