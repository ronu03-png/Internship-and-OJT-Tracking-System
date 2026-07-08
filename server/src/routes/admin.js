import { Router } from "express";
import bcrypt from "bcryptjs";
import db from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

// Get full user details for editing
router.get("/users/:id", authRequired, requireRole("admin"), (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// Update user status (active / inactive)
router.patch("/users/:id/status", authRequired, requireRole("admin"), (req, res) => {
  const { status } = req.body || {};
  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  db.prepare("UPDATE users SET status = ? WHERE id = ?").run(status, user.id);
  res.json({ ok: true });
});

// Update user details (admin only)
router.put("/users/:id", authRequired, requireRole("admin"), (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const f = req.body || {};
  const full_name = f.full_name ?? user.full_name;
  const email = f.email ?? user.email;
  const role = f.role ?? user.role;
  const department = f.department ?? user.department;
  const phone = f.phone ?? user.phone;
  const course = role === "intern" ? (f.course ?? user.course) : null;
  const company_name = role !== "intern" ? (f.company_name ?? user.company_name) : null;
  const position = role === "supervisor" ? (f.position ?? user.position) : null;
  const supervisor_id = role === "intern" ? (f.supervisor_id ?? user.supervisor_id) : null;
  const required_hours = role === "intern" ? (Number(f.required_hours) || user.required_hours) : 0;
  const student_id = role === "intern" ? (f.student_id ?? user.student_id) : null;
  const status = f.status ?? user.status;

  if (email !== user.email) {
    const exists = db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(email, user.id);
    if (exists) return res.status(409).json({ error: "Email already in use" });
  }

  let passwordClause = "";
  let params = [full_name, email, role, department, phone, course, company_name, position, supervisor_id, required_hours, student_id, status];
  if (f.password) {
    const hash = bcrypt.hashSync(f.password, 10);
    passwordClause = ", password_hash = ?";
    params.push(hash);
  }
  params.push(user.id);

  db.prepare(
    `UPDATE users SET full_name = ?, email = ?, role = ?, department = ?, phone = ?, course = ?, company_name = ?, position = ?, supervisor_id = ?, required_hours = ?, student_id = ?, status = ?${passwordClause} WHERE id = ?`
  ).run(...params);

  res.json({ ok: true });
});

// Admin stats
router.get("/stats", authRequired, requireRole("admin"), (req, res) => {
  const totalUsers = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
  const studentCount = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'intern'").get().n;
  const companyCount = db.prepare("SELECT COUNT(*) AS n FROM companies").get().n;
  const placementCount = db.prepare("SELECT COUNT(*) AS n FROM internship_placements").get().n;
  const pendingRequirements = db
    .prepare("SELECT COUNT(*) AS n FROM requirements WHERE status = 'submitted'")
    .get().n;
  const announcementCount = db.prepare("SELECT COUNT(*) AS n FROM announcements").get().n;
  const eventCount = db.prepare("SELECT COUNT(*) AS n FROM calendar_events").get().n;
  const auditCount = db.prepare("SELECT COUNT(*) AS n FROM audit_logs").get().n;
  res.json({
    total_users: totalUsers,
    student_count: studentCount,
    company_count: companyCount,
    placement_count: placementCount,
    pending_requirements: pendingRequirements,
    announcement_count: announcementCount,
    event_count: eventCount,
    audit_count: auditCount,
  });
});

export default router;
