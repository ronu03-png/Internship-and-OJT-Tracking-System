import { Router } from "express";
import db from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

// People the current user is allowed to message.
function contactsFor(user) {
  if (user.role === "intern") {
    const me = db.prepare("SELECT supervisor_id FROM users WHERE id = ?").get(user.id);
    if (!me?.supervisor_id) return [];
    return db
      .prepare("SELECT id, full_name, role, company_name FROM users WHERE id = ?")
      .all(me.supervisor_id);
  }
  return db
    .prepare("SELECT id, full_name, role, position FROM users WHERE supervisor_id = ?")
    .all(user.id);
}

router.get("/contacts", authRequired, (req, res) => {
  const contacts = contactsFor(req.user).map((c) => {
    const unread = db
      .prepare(
        "SELECT COUNT(*) AS n FROM messages WHERE sender_id = ? AND recipient_id = ? AND read_at IS NULL"
      )
      .get(c.id, req.user.id).n;
    return { ...c, unread };
  });
  res.json(contacts);
});

router.get("/:userId", authRequired, (req, res) => {
  const otherId = Number(req.params.userId);
  const rows = db
    .prepare(
      `SELECT * FROM messages
       WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
       ORDER BY id ASC`
    )
    .all(req.user.id, otherId, otherId, req.user.id);
  db.prepare(
    "UPDATE messages SET read_at = datetime('now') WHERE sender_id = ? AND recipient_id = ? AND read_at IS NULL"
  ).run(otherId, req.user.id);
  res.json(rows);
});

router.post("/", authRequired, (req, res) => {
  const { recipient_id, body } = req.body || {};
  if (!recipient_id || !body?.trim()) {
    return res.status(400).json({ error: "Recipient and message body are required" });
  }
  const allowed = contactsFor(req.user).some((c) => c.id === Number(recipient_id));
  if (!allowed) return res.status(403).json({ error: "You cannot message this user" });
  const info = db
    .prepare("INSERT INTO messages (sender_id, recipient_id, body) VALUES (?, ?, ?)")
    .run(req.user.id, recipient_id, body.trim());
  res.status(201).json(db.prepare("SELECT * FROM messages WHERE id = ?").get(info.lastInsertRowid));
});

export default router;
