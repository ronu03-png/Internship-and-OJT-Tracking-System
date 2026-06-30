import { Router } from "express";
import db from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

// List announcements with pinned first
router.get("/", authRequired, (req, res) => {
  const rows = db
    .prepare(
      `SELECT a.*, u.full_name AS author_name FROM announcements a
       JOIN users u ON u.id = a.author_id
       ORDER BY a.pinned DESC, a.created_at DESC`
    )
    .all();
  res.json(rows);
});

// Create announcement
router.post("/", authRequired, requireRole("admin"), (req, res) => {
  const { title, content, pinned, attachment_url } = req.body || {};
  if (!title || !content) return res.status(400).json({ error: "Title and content are required" });
  const info = db
    .prepare(
      "INSERT INTO announcements (title, content, author_id, pinned, attachment_url) VALUES (?, ?, ?, ?, ?)"
    )
    .run(title, content, req.user.id, pinned ? 1 : 0, attachment_url || null);
  res.status(201).json(db.prepare("SELECT * FROM announcements WHERE id = ?").get(info.lastInsertRowid));
});

// Delete announcement
router.delete("/:id", authRequired, requireRole("admin"), (req, res) => {
  const row = db.prepare("SELECT * FROM announcements WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Announcement not found" });
  db.prepare("DELETE FROM announcements WHERE id = ?").run(row.id);
  res.json({ ok: true });
});

export default router;
