import { useEffect, useState } from "react";
import { Users, Building2, Briefcase, FileCheck2, CalendarClock, FileText, Activity, Bell, Clock, GraduationCap } from "lucide-react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext.jsx";
import { StatCard, Spinner, Badge } from "../../components/ui.jsx";

function MiniBar({ label, value, max, color }) {
  const pct = Math.min(100, Math.round((value / (max || 1)) * 100));
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-sm"><span className="text-slate-600">{label}</span><span className="font-semibold text-slate-800">{value}</span></div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get("/stats/coordinator").then((res) => setStats(res.data)).catch(() => {});
    api.get("/admin/audit").then((res) => setActivities(res.data.slice(0, 8))).catch(() => {});
    api.get("/notifications").then((res) => setNotifications(res.data.slice(0, 5))).catch(() => {});
  }, []);

  if (!stats) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-100 via-brand-50 to-white p-6 shadow-card sm:p-8">
        <div className="absolute inset-y-0 left-0 w-2 bg-brand-gradient" />
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-300/40 blur-3xl" />
        <div className="absolute -bottom-20 -right-12 h-40 w-40 rounded-full bg-accent-300/25 blur-3xl" />
        <div className="relative">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white shadow-sm"><GraduationCap size={14} /> OJT Coordinator</div>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Coordinator Dashboard</h1>
          <p className="mt-1 text-slate-600">Welcome back, {user.full_name.split(" ")[0]}. Manage students, companies, and placements.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} tone="brand" label="Students" value={stats.student_count} />
        <StatCard icon={Users} tone="emerald" label="Active Interns" value={stats.active_interns} />
        <StatCard icon={Users} tone="sky" label="Completed OJT" value={stats.completed_interns} />
        <StatCard icon={Building2} tone="amber" label="Companies" value={stats.company_count} />
        <StatCard icon={Briefcase} tone="accent" label="Placements" value={stats.placement_count} />
        <StatCard icon={FileCheck2} tone="rose" label="Pending Requirements" value={stats.pending_requirements} />
        <StatCard icon={CalendarClock} tone="brand" label="Pending Attendance" value={stats.pending_attendance} />
        <StatCard icon={FileText} tone="purple" label="Pending Reports" value={stats.pending_reports} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Program Overview</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <MiniBar label="Attendance Today" value={stats.attendance_today} max={stats.student_count} color="bg-emerald-500" />
            <MiniBar label="Late Today" value={stats.late_today} max={stats.student_count} color="bg-amber-500" />
            <MiniBar label="Pending Evaluations" value={stats.pending_evaluations} max={stats.student_count} color="bg-rose-500" />
            <MiniBar label="Pending Reports" value={stats.pending_reports} max={500} color="bg-violet-500" />
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Quick Actions</h3>
          <div className="space-y-2">
            {[{label:"Post announcement",to:"/announcements"},{label:"Add calendar event",to:"/calendar"},{label:"Assign placement",to:"/placements"},{label:"View analytics",to:"/analytics"}].map((a) => (
              <a key={a.label} href={a.to} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-600">
                {a.label} <Activity size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900"><Activity size={18} className="text-brand-600" /> Recent Activity</h3>
          <div className="space-y-3">
            {activities.length === 0 ? <p className="text-sm text-slate-500">No recent activity</p> : activities.map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-600"><Clock size={14} /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">{a.action}</p>
                  <p className="text-xs text-slate-500">{a.details || a.entity || "System activity"} • {new Date(a.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900"><Bell size={18} className="text-amber-500" /> Notifications</h3>
          <div className="space-y-3">
            {notifications.length === 0 ? <p className="text-sm text-slate-500">No notifications</p> : notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-slate-300" : "bg-amber-500"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
