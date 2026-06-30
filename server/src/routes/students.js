import { Router } from "express";
import db from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

// List all students with progress and placement info.
router.get("/", authRequired, (req, res) => {
  if (!["admin", "coordinator", "supervisor"].includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  let query = `
    SELECT u.*, c.name AS company_name
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    WHERE u.role = 'intern'
  `;
  const params = [];
  if (req.user.role === "supervisor") {
    query += " AND u.supervisor_id = ?";
    params.push(req.user.id);
  }
  if (req.user.role === "coordinator" && req.user.department) {
    query += " AND (u.department = ? OR u.department IS NULL)";
    params.push(req.user.department);
  }
  query += " ORDER BY u.full_name";

  const students = db.prepare(query).all(...params);
  const result = students.map((s) => {
    const approved = db
      .prepare("SELECT COALESCE(SUM(hours),0) AS h FROM attendance WHERE intern_id = ? AND status = 'approved'")
      .get(s.id).h;
    return {
      ...s,
      approved_hours: approved,
      progress: s.required_hours ? Math.min(Math.round((approved / s.required_hours) * 100), 100) : 0,
    };
  });
  res.json(result);
});

// Get single student details.
router.get("/:id", authRequired, (req, res) => {
  const student = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'intern'").get(req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found" });
  if (req.user.role === "supervisor" && student.supervisor_id !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const approved = db
    .prepare("SELECT COALESCE(SUM(hours),0) AS h FROM attendance WHERE intern_id = ? AND status = 'approved'")
    .get(student.id).h;
  res.json({ ...student, approved_hours: approved });
});

export default router;
