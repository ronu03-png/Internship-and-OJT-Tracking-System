import { Router } from "express";
import db from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, (req, res) => {
  const rows = db
    .prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50")
    .all(req.user.id);
  res.json(rows);
});

router.get("/unread", authRequired, (req, res) => {
  const count = db.prepare("SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read_at IS NULL").get(req.user.id).n;
  res.json({ count });
});

router.patch("/:id/read", authRequired, (req, res) => {
  const row = db.prepare("SELECT * FROM notifications WHERE id = ? AND user_id = ?").get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: "Notification not found" });
  db.prepare("UPDATE notifications SET read_at = datetime('now') WHERE id = ?").run(row.id);
  res.json({ ok: true });
});

router.patch("/read-all", authRequired, (req, res) => {
  db.prepare("UPDATE notifications SET read_at = datetime('now') WHERE user_id = ? AND read_at IS NULL").run(req.user.id);
  res.json({ ok: true });
});

export default router;
