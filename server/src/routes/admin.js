import { Router } from "express";
import db from "../db.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = Router();

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

// Admin stats
router.get("/stats", authRequired, requireRole("admin", "coordinator"), (req, res) => {
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
