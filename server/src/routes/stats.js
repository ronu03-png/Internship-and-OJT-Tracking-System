import { Router } from "express";
import db from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

function internIdsForSupervisor(supervisorId) {
  return db.prepare("SELECT id FROM users WHERE supervisor_id = ?").all(supervisorId).map((r) => r.id);
}

function countPendingReports(ids) {
  if (!ids.length) return 0;
  const p = ids.map(() => "?").join(",");
  return {
    weekly: db.prepare(`SELECT COUNT(*) AS n FROM weekly_reports WHERE status = 'pending' AND intern_id IN (${p})`).get(...ids).n,
    monthly: db.prepare(`SELECT COUNT(*) AS n FROM monthly_reports WHERE status = 'pending' AND intern_id IN (${p})`).get(...ids).n,
    final: db.prepare(`SELECT COUNT(*) AS n FROM final_reports WHERE status = 'pending' AND intern_id IN (${p})`).get(...ids).n,
    journals: db.prepare(`SELECT COUNT(*) AS n FROM daily_journals WHERE status = 'pending' AND intern_id IN (${p})`).get(...ids).n,
    narrative: db.prepare(`SELECT COUNT(*) AS n FROM reports WHERE status = 'pending' AND intern_id IN (${p})`).get(...ids).n,
  };
}

router.get("/", authRequired, (req, res) => {
  if (req.user.role === "intern") {
    const me = db.prepare("SELECT required_hours, approved_hours FROM users WHERE id = ?").get(req.user.id);
    const required = me?.required_hours || 0;
    const approved = me?.approved_hours || 0;
    const daysLogged = db.prepare("SELECT COUNT(DISTINCT date) AS d FROM attendance WHERE intern_id = ?").get(req.user.id).d;
    const reports = db.prepare("SELECT status, COUNT(*) AS n FROM reports WHERE intern_id = ? GROUP BY status").all(req.user.id);
    const weekly = db.prepare("SELECT status, COUNT(*) AS n FROM weekly_reports WHERE intern_id = ? GROUP BY status").all(req.user.id);
    const monthly = db.prepare("SELECT status, COUNT(*) AS n FROM monthly_reports WHERE intern_id = ? GROUP BY status").all(req.user.id);
    const requirementsApproved = db.prepare("SELECT COUNT(*) AS n FROM requirements WHERE intern_id = ? AND status = 'approved'").get(req.user.id).n;
    const requirementsTotal = db.prepare("SELECT COUNT(*) AS n FROM requirements WHERE intern_id = ?").get(req.user.id).n;
    const evaluation = db.prepare("SELECT overall_rating FROM evaluations WHERE intern_id = ? ORDER BY id DESC LIMIT 1").get(req.user.id);
    const applicationCount = db.prepare("SELECT COUNT(*) AS n FROM applications WHERE student_id = ?").get(req.user.id).n;
    return res.json({
      role: "intern",
      required_hours: required,
      approved_hours: approved,
      remaining_hours: Math.max(required - approved, 0),
      progress: required ? Math.min(Math.round((approved / required) * 100), 100) : 0,
      days_logged: daysLogged,
      reports_by_status: reports.reduce((a, r) => ({ ...a, [r.status]: r.n }), {}),
      weekly_reports_by_status: weekly.reduce((a, r) => ({ ...a, [r.status]: r.n }), {}),
      monthly_reports_by_status: monthly.reduce((a, r) => ({ ...a, [r.status]: r.n }), {}),
      requirements_approved: requirementsApproved,
      requirements_total: requirementsTotal,
      application_count: applicationCount,
      overall_rating: evaluation?.overall_rating || 0,
    });
  }

  const ids = internIdsForSupervisor(req.user.id);
  const pending = countPendingReports(ids);
  const totalPending = pending.weekly + pending.monthly + pending.final + pending.journals + pending.narrative;
  const pendingAttendance = ids.length
    ? db.prepare(`SELECT COUNT(*) AS n FROM attendance WHERE status = 'pending' AND intern_id IN (${ids.map(() => "?").join(",")})`).get(...ids).n
    : 0;
  const pendingRequirements = ids.length
    ? db.prepare(`SELECT COUNT(*) AS n FROM requirements WHERE status IN ('submitted','pending') AND intern_id IN (${ids.map(() => "?").join(",")})`).get(...ids).n
    : 0;
  const openOpenings = db.prepare("SELECT COUNT(*) AS n FROM openings WHERE supervisor_id = ? AND status = 'open'").get(req.user.id).n;
  const newApplicants = db.prepare(
    `SELECT COUNT(*) AS n FROM applications a JOIN openings o ON o.id = a.opening_id WHERE o.supervisor_id = ? AND a.status = 'pending'`
  ).get(req.user.id).n;
  const pendingEvaluations = ids.length
    ? db.prepare(`SELECT COUNT(*) AS n FROM users WHERE role = 'intern' AND supervisor_id = ? AND status = 'active' AND id NOT IN (SELECT intern_id FROM evaluations)`).get(req.user.id).n
    : 0;
  res.json({
    role: "supervisor",
    intern_count: ids.length,
    pending_attendance: pendingAttendance,
    pending_reports: totalPending,
    pending_requirements: pendingRequirements,
    open_openings: openOpenings,
    new_applicants: newApplicants,
    pending_evaluations: pendingEvaluations,
    reports_breakdown: pending,
  });
});

// Supervisor: list of their interns with progress.
router.get("/interns", authRequired, (req, res) => {
  if (req.user.role !== "supervisor") return res.status(403).json({ error: "Forbidden" });
  const interns = db.prepare("SELECT id, full_name, email, position, department, course, required_hours, approved_hours FROM users WHERE supervisor_id = ?").all(req.user.id);
  const result = interns.map((i) => ({
    ...i,
    progress: i.required_hours ? Math.min(Math.round((i.approved_hours / i.required_hours) * 100), 100) : 0,
  }));
  res.json(result);
});

// Overview stats (admin only)
router.get("/coordinator", authRequired, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const studentCount = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'intern'").get().n;
  const activeInterns = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'intern' AND status = 'active'").get().n;
  const completedInterns = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'intern' AND status = 'completed'").get().n;
  const companyCount = db.prepare("SELECT COUNT(*) AS n FROM companies").get().n;
  const placementCount = db.prepare("SELECT COUNT(*) AS n FROM internship_placements").get().n;
  const pendingRequirements = db.prepare("SELECT COUNT(*) AS n FROM requirements WHERE status IN ('submitted','pending')").get().n;
  const pendingAttendance = db.prepare("SELECT COUNT(*) AS n FROM attendance WHERE status = 'pending'").get().n;
  const pendingReports = db.prepare(`SELECT COUNT(*) AS n FROM (
    SELECT id FROM weekly_reports WHERE status = 'pending'
    UNION ALL SELECT id FROM monthly_reports WHERE status = 'pending'
    UNION ALL SELECT id FROM final_reports WHERE status = 'pending'
    UNION ALL SELECT id FROM daily_journals WHERE status = 'pending'
    UNION ALL SELECT id FROM reports WHERE status = 'pending'
  )`).get().n;
  const todayAttendance = db.prepare("SELECT COUNT(DISTINCT intern_id) AS n FROM attendance WHERE date = date('now') AND status IN ('present','late')").get().n;
  const lateToday = db.prepare("SELECT COUNT(DISTINCT intern_id) AS n FROM attendance WHERE date = date('now') AND status = 'late'").get().n;
  const pendingEvaluations = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'intern' AND status = 'active' AND id NOT IN (SELECT intern_id FROM evaluations)").get().n;
  res.json({
    student_count: studentCount,
    active_interns: activeInterns,
    completed_interns: completedInterns,
    company_count: companyCount,
    placement_count: placementCount,
    pending_requirements: pendingRequirements,
    pending_attendance: pendingAttendance,
    pending_reports: pendingReports,
    attendance_today: todayAttendance,
    late_today: lateToday,
    pending_evaluations: pendingEvaluations,
  });
});

// Admin stats
router.get("/admin", authRequired, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const totalUsers = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
  const studentCount = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'intern'").get().n;
  const activeInterns = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'intern' AND status = 'active'").get().n;
  const completedInterns = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'intern' AND status = 'completed'").get().n;
  const companyCount = db.prepare("SELECT COUNT(*) AS n FROM companies").get().n;
  const placementCount = db.prepare("SELECT COUNT(*) AS n FROM internship_placements").get().n;
  const pendingRequirements = db.prepare("SELECT COUNT(*) AS n FROM requirements WHERE status IN ('submitted','pending')").get().n;
  const announcementCount = db.prepare("SELECT COUNT(*) AS n FROM announcements").get().n;
  const eventCount = db.prepare("SELECT COUNT(*) AS n FROM calendar_events").get().n;
  const auditCount = db.prepare("SELECT COUNT(*) AS n FROM audit_logs").get().n;
  const todayAttendance = db.prepare("SELECT COUNT(DISTINCT intern_id) AS n FROM attendance WHERE date = date('now') AND status IN ('present','late')").get().n;
  const lateToday = db.prepare("SELECT COUNT(DISTINCT intern_id) AS n FROM attendance WHERE date = date('now') AND status = 'late'").get().n;
  const pendingEvaluations = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'intern' AND status = 'active' AND id NOT IN (SELECT intern_id FROM evaluations)").get().n;
  const courseDistribution = db.prepare("SELECT course, COUNT(*) AS n FROM users WHERE role = 'intern' GROUP BY course").all();
  res.json({
    total_users: totalUsers,
    student_count: studentCount,
    active_interns: activeInterns,
    completed_interns: completedInterns,
    company_count: companyCount,
    placement_count: placementCount,
    pending_requirements: pendingRequirements,
    announcement_count: announcementCount,
    event_count: eventCount,
    audit_count: auditCount,
    attendance_today: todayAttendance,
    late_today: lateToday,
    pending_evaluations: pendingEvaluations,
    course_distribution: courseDistribution,
  });
});

export default router;
