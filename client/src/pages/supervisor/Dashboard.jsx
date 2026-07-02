import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, CalendarClock, FileText, Briefcase, UserPlus, FileCheck2, BookOpen, Star, Bell, Clock, Activity } from "lucide-react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext.jsx";
import { StatCard, Spinner, Avatar, ProgressBar, Badge } from "../../components/ui.jsx";
import OJTProgress from "../../components/OJTProgress.jsx";

function PendingItem({ label, count, to, color }) {
  return (
    <Link to={to} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 transition hover:bg-brand-50">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className={`rounded-full px-2.5 py-1 text-xs font-bold text-white ${color}`}>{count}</span>
    </Link>
  );
}

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [interns, setInterns] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get("/stats").then((res) => setStats(res.data));
    api.get("/stats/interns").then((res) => setInterns(res.data));
    api.get("/notifications").then((res) => setNotifications(res.data.slice(0, 5))).catch(() => {});
  }, []);

  if (!stats) return <Spinner />;

  const breakdown = stats.reports_breakdown || {};

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-100 via-brand-50 to-white p-6 shadow-card sm:p-8">
        <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-b from-brand-500 to-brand-700" />
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-300/40 blur-3xl" />
        <div className="absolute -bottom-20 -right-12 h-40 w-40 rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="relative">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-1 text-xs font-semibold text-white shadow-sm"><Briefcase size={14} /> Company Supervisor</div>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">{user.company_name || "Supervisor"} Dashboard</h1>
          <p className="mt-1 text-slate-600">Review your interns' attendance, reports, and evaluations.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/interns" className="block hover-lift"><StatCard icon={Users} tone="brand" label="Interns" value={stats.intern_count} /></Link>
        <Link to="/openings" className="block hover-lift"><StatCard icon={Briefcase} tone="brand" label="Open postings" value={stats.open_openings} sub="OJT openings" /></Link>
        <Link to="/openings" className="block hover-lift"><StatCard icon={UserPlus} tone="brand" label="New applicants" value={stats.new_applicants} sub="to review" /></Link>
        <Link to="/attendance" className="block hover-lift"><StatCard icon={CalendarClock} tone="brand" label="Pending attendance" value={stats.pending_attendance} sub="awaiting approval" /></Link>
        <Link to="/weekly-reports" className="block hover-lift"><StatCard icon={FileText} tone="brand" label="Pending reports" value={stats.pending_reports} sub="to review" /></Link>
        <Link to="/requirements" className="block hover-lift"><StatCard icon={FileCheck2} tone="brand" label="Pending requirements" value={stats.pending_requirements} sub="to review" /></Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-4 font-semibold text-slate-800">Intern progress</h2>
          <div className="mb-5">
            <OJTProgress
              completed={320}
              required={486}
              title="Sample Intern Progress"
              subtitle="Preview: hours completed toward the 486-hour OJT requirement"
            />
          </div>
          {interns.length === 0 ? (
            <p className="text-sm text-slate-400">No interns registered under you yet.</p>
          ) : (
            <div className="space-y-5">
              {interns.slice(0, 8).map((i) => (
                <div key={i.id} className="flex items-center gap-4">
                  <Avatar name={i.full_name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="truncate font-medium text-slate-700">{i.full_name} <span className="text-slate-400">· {i.course || "Intern"}</span></span>
                      <span className="shrink-0 text-slate-500">{i.approved_hours}/{i.required_hours} hrs</span>
                    </div>
                    <ProgressBar value={i.progress} size="md" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Pending Reviews</h3>
            <div className="space-y-2">
              <PendingItem label="Journals" count={breakdown.journals || 0} to="/journals" color="bg-blue-500" />
              <PendingItem label="Weekly Reports" count={breakdown.weekly || 0} to="/weekly-reports" color="bg-violet-500" />
              <PendingItem label="Monthly Reports" count={breakdown.monthly || 0} to="/monthly-reports" color="bg-amber-500" />
              <PendingItem label="Final Reports" count={breakdown.final || 0} to="/final-reports" color="bg-emerald-500" />
              <PendingItem label="Evaluations" count={stats.pending_evaluations || 0} to="/evaluations" color="bg-rose-500" />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500"><Bell size={14} /> Notifications</h3>
            <div className="space-y-3">
              {notifications.length === 0 ? <p className="text-sm text-slate-500">No notifications</p> : notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-2 text-sm">
                  <div className={`mt-1.5 h-2 w-2 rounded-full ${n.read_at ? "bg-slate-300" : "bg-brand-500"}`} />
                  <p className="text-slate-700">{n.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
