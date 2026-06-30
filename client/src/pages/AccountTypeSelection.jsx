import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Shield, Users, Briefcase, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const ROLES = [
  {
    key: "intern",
    title: "Intern / Student",
    desc: "Create a student account to track attendance, submit reports, and find OJT placements.",
    icon: GraduationCap,
    gradient: "from-sky-500 to-cyan-400",
    bg: "bg-sky-50",
    border: "border-sky-100",
    text: "text-sky-700",
    shadow: "shadow-sky-200",
    floatDelay: "0s",
  },
  {
    key: "supervisor",
    title: "Company Supervisor",
    desc: "Register as a company supervisor to mentor interns and evaluate their performance.",
    icon: Briefcase,
    gradient: "from-emerald-600 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    text: "text-emerald-700",
    shadow: "shadow-emerald-200",
    floatDelay: "1s",
  },
  {
    key: "coordinator",
    title: "OJT Coordinator",
    desc: "Sign up as a coordinator to manage students, companies, and internship placements.",
    icon: Users,
    gradient: "from-violet-600 to-indigo-500",
    bg: "bg-violet-50",
    border: "border-violet-100",
    text: "text-violet-700",
    shadow: "shadow-violet-200",
    floatDelay: "2s",
  },
  {
    key: "admin",
    title: "Administrator",
    desc: "Create an admin account to oversee the system, analytics, users, and audit logs.",
    icon: Shield,
    gradient: "from-slate-800 to-slate-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-800",
    shadow: "shadow-slate-200",
    floatDelay: "3s",
  },
];

export default function AccountTypeSelection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (user) { navigate("/"); return null; }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute top-40 right-0 h-80 w-80 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-12 text-center animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg">
              <GraduationCap size={22} />
            </div>
            <span className="text-xl font-extrabold text-slate-900">InternTrack</span>
          </Link>
          <div className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
            <Sparkles size={14} className="text-amber-500" /> Start your journey
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">Choose your account type</h1>
          <p className="mx-auto mt-2 max-w-lg text-slate-500">Select the role that best describes you to create a personalized InternTrack account.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r, idx) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.key}
                to={`/register/${r.key}`}
                className={`group flex h-full flex-col rounded-3xl border ${r.border} ${r.bg} p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${r.shadow} animate-reveal-up`}
                style={{ animationDelay: `${idx * 120}ms` }}
              >
                <div className={`mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${r.gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 animate-float`} style={{ animationDelay: r.floatDelay }}>
                  <Icon size={28} />
                </div>
                <h3 className={`text-lg font-bold ${r.text}`}>{r.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{r.desc}</p>
                <div className={`mt-5 flex items-center gap-1 text-sm font-semibold ${r.text} transition-transform group-hover:translate-x-1`}>
                  Get started <ArrowRight size={16} />
                </div>
              </Link>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500 animate-fade-in">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
