import { Router } from "express";
import db from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

// List placements
router.get("/", authRequired, (req, res) => {
  if (!["admin", "supervisor"].includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  let query = `
    SELECT p.*, u.full_name AS student_name, u.course AS student_course, c.name AS company_name, s.full_name AS supervisor_name
    FROM internship_placements p
    JOIN users u ON u.id = p.student_id
    LEFT JOIN companies c ON c.id = p.company_id
    LEFT JOIN users s ON s.id = p.supervisor_id
    WHERE 1=1
  `;
  const params = [];
  if (req.user.role === "supervisor") {
    query += " AND p.supervisor_id = ?";
    params.push(req.user.id);
  }
  query += " ORDER BY p.created_at DESC";
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

// Create placement
router.post("/", authRequired, requireRole("admin", "supervisor"), (req, res) => {
  const { student_id, company_id, supervisor_id, start_date, end_date } = req.body || {};
  if (!student_id || !company_id) {
    return res.status(400).json({ error: "Student and company are required" });
  }
  const info = db
    .prepare(
      `INSERT INTO internship_placements (student_id, company_id, supervisor_id, coordinator_id, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(student_id, company_id, supervisor_id || null, req.user.id, start_date || null, end_date || null);
  db.prepare("UPDATE users SET company_id = ?, supervisor_id = ? WHERE id = ?").run(
    company_id,
    supervisor_id || null,
    student_id
  );
  res.status(201).json(db.prepare("SELECT * FROM internship_placements WHERE id = ?").get(info.lastInsertRowid));
});

// Update placement status
router.patch("/:id/status", authRequired, requireRole("admin", "supervisor"), (req, res) => {
  const { status } = req.body || {};
  if (!["pending", "approved", "rejected", "completed"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const row = db.prepare("SELECT * FROM internship_placements WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Placement not found" });
  db.prepare("UPDATE internship_placements SET status = ? WHERE id = ?").run(status, row.id);
  res.json({ ok: true });
});

export default router;
