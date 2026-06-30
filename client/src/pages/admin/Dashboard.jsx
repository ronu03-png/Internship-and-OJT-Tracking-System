import { useEffect, useState } from "react";
import { Users, Building2, Briefcase, FileCheck2, Megaphone, CalendarDays, Shield, Activity, Bell, Clock } from "lucide-react";
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

function PieChart({ data }) {
  const total = data.reduce((a, b) => a + b.n, 0) || 1;
  let acc = 0;
  const colors = ["#2563eb", "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="h-40 w-40">
        {data.map((d, i) => {
          const start = acc / total * 360;
          const sweep = d.n / total * 360;
          acc += d.n;
          const large = sweep > 180 ? 1 : 0;
          const rad = (angle) => (angle - 90) * Math.PI / 180;
          const x1 = 50 + 40 * Math.cos(rad(start));
          const y1 = 50 + 40 * Math.sin(rad(start));
          const x2 = 50 + 40 * Math.cos(rad(start + sweep));
          const y2 = 50 + 40 * Math.sin(rad(start + sweep));
          return <path key={i} d={`M50,50 L${x1},${y1} A40,40 0 ${large},1 ${x2},${y2} Z`} fill={colors[i % colors.length]} stroke="white" strokeWidth="1" />;
        })}
        <circle cx="50" cy="50" r="20" fill="white" />
      </svg>
      <div className="flex-1 space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="flex-1 text-slate-600">{d.course}</span>
            <span className="font-semibold text-slate-800">{d.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get("/stats/admin").then((res) => setStats(res.data)).catch(() => {});
    api.get("/admin/audit").then((res) => setActivities(res.data.slice(0, 8))).catch(() => {});
    api.get("/notifications").then((res) => setNotifications(res.data.slice(0, 5))).catch(() => {});
  }, []);

  if (!stats) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-300 via-transparent to-transparent" />
        <div className="relative">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur"><Shield size={14} /> Administrator</div>
          <h1 className="text-2xl font-bold sm:text-3xl">Executive Dashboard</h1>
          <p className="mt-1 text-white/70">Welcome back, {user.full_name.split(" ")[0]}. Oversee the entire OJT program at a glance.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} tone="brand" label="Total Users" value={stats.total_users} />
        <StatCard icon={Users} tone="emerald" label="Students" value={stats.student_count} />
        <StatCard icon={Building2} tone="amber" label="Companies" value={stats.company_count} />
        <StatCard icon={Briefcase} tone="sky" label="Placements" value={stats.placement_count} />
        <StatCard icon={Activity} tone="emerald" label="Active Interns" value={stats.active_interns} />
        <StatCard icon={FileCheck2} tone="brand" label="Completed OJT" value={stats.completed_interns} />
        <StatCard icon={FileCheck2} tone="rose" label="Pending Requirements" value={stats.pending_requirements} />
        <StatCard icon={Users} tone="purple" label="Pending Evaluations" value={stats.pending_evaluations} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Program Overview</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <MiniBar label="Attendance Today" value={stats.attendance_today} max={stats.student_count} color="bg-emerald-500" />
            <MiniBar label="Late Today" value={stats.late_today} max={stats.student_count} color="bg-amber-500" />
            <MiniBar label="Pending Reports" value={stats.pending_reports} max={500} color="bg-rose-500" />
            <MiniBar label="Announcements" value={stats.announcement_count} max={20} color="bg-blue-500" />
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Interns by Course</h3>
          {stats.course_distribution?.length ? <PieChart data={stats.course_distribution} /> : <p className="text-sm text-slate-500">No data</p>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900"><Activity size={18} className="text-blue-600" /> Recent Activity</h3>
          <div className="space-y-3">
            {activities.length === 0 ? <p className="text-sm text-slate-500">No recent activity</p> : activities.map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-600"><Clock size={14} /></div>
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
