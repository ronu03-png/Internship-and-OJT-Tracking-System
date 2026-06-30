import { Router } from "express";
import db from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, (req, res) => {
  const rows = db
    .prepare("SELECT * FROM calendar_events ORDER BY start_date DESC")
    .all();
  res.json(rows);
});

router.post("/", authRequired, requireRole("admin"), (req, res) => {
  const { title, type, start_date, end_date, description } = req.body || {};
  if (!title || !start_date) {
    return res.status(400).json({ error: "Title and start date are required" });
  }
  const info = db
    .prepare(
      "INSERT INTO calendar_events (title, type, start_date, end_date, description, created_by) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(title, type || null, start_date, end_date || null, description || null, req.user.id);
  res.status(201).json(db.prepare("SELECT * FROM calendar_events WHERE id = ?").get(info.lastInsertRowid));
});

router.delete("/:id", authRequired, requireRole("admin"), (req, res) => {
  const row = db.prepare("SELECT * FROM calendar_events WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Event not found" });
  db.prepare("DELETE FROM calendar_events WHERE id = ?").run(row.id);
  res.json({ ok: true });
});

export default router;
