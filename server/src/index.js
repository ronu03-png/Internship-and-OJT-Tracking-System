import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import attendanceRoutes from "./routes/attendance.js";
import reportRoutes from "./routes/reports.js";
import messageRoutes from "./routes/messages.js";
import statsRoutes from "./routes/stats.js";
import openingRoutes from "./routes/openings.js";
import requirementRoutes from "./routes/requirements.js";
import companyRoutes from "./routes/companies.js";
import studentRoutes from "./routes/students.js";
import placementRoutes from "./routes/placements.js";
import adminRoutes from "./routes/admin.js";
import journalRoutes from "./routes/journals.js";
import weeklyReportRoutes from "./routes/weeklyReports.js";
import evaluationRoutes from "./routes/evaluations.js";
import announcementRoutes from "./routes/announcements.js";
import calendarRoutes from "./routes/calendar.js";
import auditRoutes from "./routes/audit.js";
import settingsRoutes from "./routes/settings.js";
import monthlyReportRoutes from "./routes/monthlyReports.js";
import finalReportRoutes from "./routes/finalReports.js";
import notificationRoutes from "./routes/notifications.js";

const app = express();

// In production set CLIENT_ORIGIN to your frontend URL (e.g. https://your-site.netlify.app)
// to restrict cross-origin access. Multiple origins can be comma-separated.
// When unset, all origins are allowed (convenient for local development).
const clientOrigin = process.env.CLIENT_ORIGIN;
const allowedOrigins = clientOrigin
  ? clientOrigin.split(",").map((o) => o.trim())
  : null;
app.use(
  cors({
    origin: allowedOrigins || true,
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/openings", openingRoutes);
app.use("/api/requirements", requirementRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/placements", placementRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/weekly-reports", weeklyReportRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/admin/audit", auditRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/monthly-reports", monthlyReportRoutes);
app.use("/api/final-reports", finalReportRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Internship Tracking System API running on http://localhost:${PORT}`);
});
