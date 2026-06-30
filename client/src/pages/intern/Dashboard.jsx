import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, CalendarCheck, FileText, Hourglass, MessagesSquare, ArrowRight, Briefcase, FileCheck2, GraduationCap, Bell, BookOpen, Star, Calendar } from "lucide-react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext.jsx";
import { StatCard, Spinner, ProgressBar, Badge } from "../../components/ui.jsx";

const QUICK_ACTIONS = [
  { to: "/openings", icon: Briefcase, title: "Find OJT", desc: "Browse & contact companies" },
  { to: "/attendance", icon: CalendarCheck, title: "Log attendance", desc: "Record time in / out" },
  { to: "/journals", icon: BookOpen, title: "Daily journal", desc: "Log today's tasks" },
  { to: "/weekly-reports", icon: FileText, title: "Weekly report", desc: "Submit weekly summary" },
  { to: "/requirements", icon: FileCheck2, title: "Requirements", desc: "Submit OJT documents" },
  { to: "/messages", icon: MessagesSquare, title: "Messages", desc: "Chat with supervisor" },
];

export default function InternDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get("/stats").then((res) => setStats(res.data));
    api.get("/notifications").then((res) => setNotifications(res.data.slice(0, 5))).catch(() => {});
    api.get("/calendar").then((res) => setEvents(res.data.slice(0, 3))).catch(() => {});
  }, []);

  if (!stats) return <Spinner />;

  const weekly = stats.weekly_reports_by_status || {};
  const monthly = stats.monthly_reports_by_status || {};

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-100 via-brand-50 to-white p-6 shadow-card sm:p-8">
        <div className="absolute inset-y-0 left-0 w-2 bg-brand-gradient" />
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-300/40 blur-3xl" />
        <div className="absolute -bottom-20 -right-12 h-40 w-40 rounded-full bg-accent-300/25 blur-3xl" />
        <div className="relative">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white shadow-sm"><GraduationCap size={14} /> Intern / Student</div>
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Welcome back, {user.full_name.split(" ")[0]} 👋</h1>
          <p className="mt-1 text-slate-600">Here is your internship progress so far.</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
            <span className="font-semibold text-brand-600">{stats.progress}% complete</span>
            <span>{stats.approved_hours} / {stats.required_hours} hours approved</span>
            {stats.overall_rating > 0 && <span>⭐ Overall rating: {stats.overall_rating}%</span>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Clock} tone="emerald" label="Approved hours" value={stats.approved_hours} sub={`of ${stats.required_hours} required`} />
        <StatCard icon={Hourglass} tone="amber" label="Remaining hours" value={stats.remaining_hours} sub="to complete" />
        <StatCard icon={CalendarCheck} tone="brand" label="Days logged" value={stats.days_logged} sub="attendance records" />
        <StatCard icon={FileCheck2} tone="accent" label="Requirements" value={`${stats.requirements_approved}/${stats.requirements_total}`} sub="approved" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-3 font-semibold text-slate-800">Hour completion</h2>
          <ProgressBar value={stats.progress} size="md" />
          <p className="mt-2.5 text-sm text-slate-500">{stats.approved_hours} of {stats.required_hours} hours completed.</p>
        </div>

        <div className="card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500"><Calendar size={14} /> Upcoming</h3>
          <div className="space-y-3">
            {events.length === 0 ? <p className="text-sm text-slate-500">No upcoming events</p> : events.map((e) => (
              <div key={e.id} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-600"><Calendar size={14} /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{e.title}</p>
                  <p className="text-xs text-slate-500">{e.start_date}{e.type ? ` · ${e.type}` : ""}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Weekly Reports</h3>
          <div className="space-y-2">
            {Object.entries(weekly).length === 0 ? <p className="text-sm text-slate-500">No weekly reports</p> : Object.entries(weekly).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm"><span className="capitalize text-slate-600">{status}</span><Badge status={status} /></div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Monthly Reports</h3>
          <div className="space-y-2">
            {Object.entries(monthly).length === 0 ? <p className="text-sm text-slate-500">No monthly reports</p> : Object.entries(monthly).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm"><span className="capitalize text-slate-600">{status}</span><Badge status={status} /></div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500"><Bell size={14} /> Notifications</h3>
          <div className="space-y-3">
            {notifications.length === 0 ? <p className="text-sm text-slate-500">No notifications</p> : notifications.slice(0, 4).map((n) => (
              <div key={n.id} className="flex items-start gap-2 text-sm">
                <div className={`mt-1.5 h-2 w-2 rounded-full ${n.read_at ? "bg-slate-300" : "bg-brand-500"}`} />
                <p className="text-slate-700">{n.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_ACTIONS.map(({ to, icon: Icon, title, desc }) => (
          <Link key={to} to={to} className="card-interactive group flex items-center gap-3 p-5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-transform duration-200 group-hover:scale-110 group-hover:bg-brand-100">
              <Icon size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800">{title}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
            <ArrowRight size={16} className="text-slate-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand-500" />
          </Link>
        ))}
      </div>
    </div>
  );
}
