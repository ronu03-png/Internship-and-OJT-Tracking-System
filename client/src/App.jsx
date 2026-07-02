import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import { Spinner } from "./components/ui.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Messages from "./pages/Messages.jsx";
import Notifications from "./pages/Notifications.jsx";

import InternDashboard from "./pages/intern/Dashboard.jsx";
import InternAttendance from "./pages/intern/Attendance.jsx";
import InternReports from "./pages/intern/Reports.jsx";
import InternOpenings from "./pages/intern/Openings.jsx";
import InternRequirements from "./pages/intern/Requirements.jsx";

import SupervisorDashboard from "./pages/supervisor/Dashboard.jsx";
import SupervisorInterns from "./pages/supervisor/Interns.jsx";
import SupervisorAttendance from "./pages/supervisor/Attendance.jsx";
import SupervisorReports from "./pages/supervisor/Reports.jsx";
import SupervisorOpenings from "./pages/supervisor/Openings.jsx";
import SupervisorRequirements from "./pages/supervisor/Requirements.jsx";

import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import AdminAuditLogs from "./pages/admin/AuditLogs.jsx";
import AdminSettings from "./pages/admin/Settings.jsx";

import ManageStudents from "./pages/supervisor/Students.jsx";
import ManageCompanies from "./pages/supervisor/Companies.jsx";
import ManagePlacements from "./pages/supervisor/Placements.jsx";

import InternJournals from "./pages/intern/Journals.jsx";
import InternWeeklyReports from "./pages/intern/WeeklyReports.jsx";

import SupervisorJournals from "./pages/supervisor/Journals.jsx";
import SupervisorWeeklyReports from "./pages/supervisor/WeeklyReports.jsx";
import SupervisorEvaluations from "./pages/supervisor/Evaluations.jsx";
import SupervisorMonthlyReports from "./pages/supervisor/MonthlyReports.jsx";
import SupervisorFinalReports from "./pages/supervisor/FinalReports.jsx";

import InternMonthlyReports from "./pages/intern/MonthlyReports.jsx";
import InternFinalReports from "./pages/intern/FinalReports.jsx";

import Announcements from "./pages/Announcements.jsx";
import Calendar from "./pages/Calendar.jsx";
import Analytics from "./pages/Analytics.jsx";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function RoleSwitch({ intern, supervisor, admin }) {
  const { user } = useAuth();
  switch (user?.role) {
    case "admin": return admin || supervisor || intern;
    case "supervisor": return supervisor || intern;
    default: return intern;
  }
}

export default function App() {
  const { user, loading } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

      <Route
        path="/dashboard"
        element={
          <Protected>
            <RoleSwitch
              intern={<InternDashboard />}
              supervisor={<SupervisorDashboard />}
              admin={<AdminDashboard />}
            />
          </Protected>
        }
      />
      <Route
        path="/attendance"
        element={
          <Protected>
            <RoleSwitch intern={<InternAttendance />} supervisor={<SupervisorAttendance />} />
          </Protected>
        }
      />
      <Route
        path="/reports"
        element={
          <Protected>
            <RoleSwitch intern={<InternReports />} supervisor={<SupervisorReports />} />
          </Protected>
        }
      />
      <Route
        path="/openings"
        element={
          <Protected>
            <RoleSwitch intern={<InternOpenings />} supervisor={<SupervisorOpenings />} />
          </Protected>
        }
      />
      <Route
        path="/requirements"
        element={
          <Protected>
            <RoleSwitch intern={<InternRequirements />} supervisor={<SupervisorRequirements />} />
          </Protected>
        }
      />
      <Route path="/messages" element={<Protected><Messages /></Protected>} />
      <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
      <Route path="/interns" element={<Protected><SupervisorInterns /></Protected>} />
      <Route path="/users" element={<Protected><AdminUsers /></Protected>} />
      <Route path="/students" element={<Protected><ManageStudents /></Protected>} />
      <Route path="/companies" element={<Protected><ManageCompanies /></Protected>} />
      <Route path="/placements" element={<Protected><ManagePlacements /></Protected>} />
      <Route path="/journals" element={<Protected><RoleSwitch intern={<InternJournals />} supervisor={<SupervisorJournals />} /></Protected>} />
      <Route path="/weekly-reports" element={<Protected><RoleSwitch intern={<InternWeeklyReports />} supervisor={<SupervisorWeeklyReports />} /></Protected>} />
      <Route path="/monthly-reports" element={<Protected><RoleSwitch intern={<InternMonthlyReports />} supervisor={<SupervisorMonthlyReports />} /></Protected>} />
      <Route path="/final-reports" element={<Protected><RoleSwitch intern={<InternFinalReports />} supervisor={<SupervisorFinalReports />} /></Protected>} />
      <Route path="/evaluations" element={<Protected><SupervisorEvaluations /></Protected>} />
      <Route path="/announcements" element={<Protected><Announcements /></Protected>} />
      <Route path="/calendar" element={<Protected><Calendar /></Protected>} />
      <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
      <Route path="/audit-logs" element={<Protected><AdminAuditLogs /></Protected>} />
      <Route path="/settings" element={<Protected><AdminSettings /></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
