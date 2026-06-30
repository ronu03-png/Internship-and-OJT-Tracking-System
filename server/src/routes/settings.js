import { Router } from "express";
import db from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", authRequired, (req, res) => {
  const rows = db.prepare("SELECT key, value FROM settings").all();
  const map = {};
  rows.forEach((r) => { map[r.key] = r.value; });
  res.json(map);
});

router.put("/", authRequired, requireRole("admin"), (req, res) => {
  const data = req.body || {};
  const insert = db.prepare("INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at");
  Object.entries(data).forEach(([key, value]) => insert.run(key, value));
  const rows = db.prepare("SELECT key, value FROM settings").all();
  const map = {};
  rows.forEach((r) => { map[r.key] = r.value; });
  res.json(map);
});

export default router;
