import { Router } from "express";
import db from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

// List evaluations for supervisor or intern
router.get("/", authRequired, (req, res) => {
  if (req.user.role === "intern") {
    const rows = db
      .prepare(
        `SELECT e.*, u.full_name AS supervisor_name FROM evaluations e
         JOIN users u ON u.id = e.supervisor_id
         WHERE e.intern_id = ?
         ORDER BY e.created_at DESC`
      )
      .all(req.user.id);
    return res.json(rows);
  }
  const ids = db.prepare("SELECT id FROM users WHERE supervisor_id = ?").all(req.user.id).map((r) => r.id);
  if (ids.length === 0) return res.json([]);
  const placeholders = ids.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT e.*, u.full_name AS intern_name FROM evaluations e
       JOIN users u ON u.id = e.intern_id
       WHERE e.intern_id IN (${placeholders})
       ORDER BY e.created_at DESC`
    )
    .all(...ids);
  res.json(rows);
});

// Create evaluation for an intern
router.post("/", authRequired, requireRole("supervisor", "admin"), (req, res) => {
  const {
    intern_id,
    attendance,
    punctuality,
    communication,
    technical_skills,
    professionalism,
    initiative,
    productivity,
    adaptability,
    teamwork,
    leadership,
    problem_solving,
    comments,
  } = req.body || {};
  if (!intern_id) return res.status(400).json({ error: "Intern is required" });

  const intern = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'intern'").get(intern_id);
  if (!intern) return res.status(404).json({ error: "Intern not found" });

  const scores = [
    attendance, punctuality, communication, technical_skills, professionalism,
    initiative, productivity, adaptability, teamwork, leadership, problem_solving,
  ].map((s) => (s === undefined ? 0 : Math.min(100, Math.max(0, Number(s)))));
  const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  const info = db
    .prepare(
      `INSERT INTO evaluations (intern_id, supervisor_id, attendance, punctuality, communication, technical_skills, professionalism, initiative, productivity, adaptability, teamwork, leadership, problem_solving, overall_rating, comments)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(intern_id, req.user.id, ...scores, overall, comments || null);
  res.status(201).json(db.prepare("SELECT * FROM evaluations WHERE id = ?").get(info.lastInsertRowid));
});

export default router;
