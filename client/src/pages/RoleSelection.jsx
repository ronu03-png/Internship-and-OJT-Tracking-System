import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Shield, Users, Briefcase, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const ROLES = [
  {
    key: "admin",
    title: "Administrator",
    desc: "System oversight, user management, audit logs, and analytics.",
    icon: Shield,
    gradient: "from-slate-900 to-slate-800",
    accent: "from-amber-400 to-amber-300",
    text: "text-slate-900",
    border: "border-slate-900/10",
    shadow: "shadow-slate-200",
    bg: "bg-slate-50",
  },
  {
    key: "coordinator",
    title: "OJT Coordinator",
    desc: "Manage students, companies, placements, and monitor progress.",
    icon: Users,
    gradient: "from-violet-700 to-indigo-600",
    accent: "from-violet-400 to-indigo-300",
    text: "text-violet-700",
    border: "border-violet-100",
    shadow: "shadow-violet-100",
    bg: "bg-violet-50/60",
  },
  {
    key: "supervisor",
    title: "Company Supervisor",
    desc: "Review attendance, reports, requirements, and evaluate interns.",
    icon: Briefcase,
    gradient: "from-emerald-700 to-teal-600",
    accent: "from-emerald-300 to-teal-200",
    text: "text-emerald-700",
    border: "border-emerald-100",
    shadow: "shadow-emerald-100",
    bg: "bg-emerald-50/60",
  },
  {
    key: "intern",
    title: "Intern / Student",
    desc: "Log attendance, submit reports, and track your OJT progress.",
    icon: GraduationCap,
    gradient: "from-blue-600 to-cyan-500",
    accent: "from-sky-300 to-cyan-200",
    text: "text-blue-600",
    border: "border-blue-100",
    shadow: "shadow-blue-100",
    bg: "bg-blue-50/60",
  },
];

export default function RoleSelection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (user) { navigate("/"); return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg">
              <GraduationCap size={22} />
            </div>
            <span className="text-xl font-extrabold text-slate-900">InternTrack</span>
          </Link>
          <h1 className="mt-8 text-3xl font-extrabold text-slate-900 sm:text-4xl">Choose your role</h1>
          <p className="mt-2 text-slate-500">Select how you want to access the system</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r) => (
            <Link
              key={r.key}
              to={`/login/${r.key}`}
              className={`group relative overflow-hidden rounded-3xl border ${r.border} bg-white p-6 shadow-lg ${r.shadow} transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
            >
              <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${r.accent} opacity-20 transition group-hover:scale-125`} />
              <div className={`relative mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${r.gradient} text-white shadow-lg`}>
                <r.icon size={28} />
              </div>
              <h2 className={`relative text-xl font-bold ${r.text}`}>{r.title}</h2>
              <p className="relative mt-2 text-sm leading-relaxed text-slate-600">{r.desc}</p>
              <div className={`relative mt-5 inline-flex items-center gap-2 text-sm font-bold ${r.text}`}>
                Sign in <ArrowRight size={16} className="transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">Register as a student</Link>
        </p>
      </div>
    </div>
  );
}
