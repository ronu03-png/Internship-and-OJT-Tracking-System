import { GraduationCap, Shield, Users, Briefcase, Clock3, MessagesSquare, CheckCircle2, BarChart3, FileCheck, Calendar } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "../constants.js";

const ROLE_META = {
  admin: {
    gradient: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
    highlights: [
      { icon: BarChart3, title: "Advanced Analytics", text: "Monitor OJT metrics, attendance trends, and completion rates in real time." },
      { icon: Shield, title: "Role & Access Control", text: "Manage users, permissions, and audit every system action." },
      { icon: Users, title: "Institution Oversight", text: "Oversee coordinators, supervisors, and student placements across the campus." },
    ],
    tagline: "Secure, executive-level control over the entire OJT ecosystem.",
  },
  supervisor: {
    gradient: "bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-800",
    highlights: [
      { icon: Clock3, title: "Attendance Verification", text: "Verify daily time-in/out logs and compute rendered hours." },
      { icon: FileCheck, title: "Reports & Requirements", text: "Review journals, weekly reports, monthly reports, and documents." },
      { icon: MessagesSquare, title: "Feedback & Evaluation", text: "Evaluate interns and provide constructive feedback." },
    ],
    tagline: "Professional tools to mentor and monitor your interns.",
  },
  intern: {
    gradient: "bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700",
    highlights: [
      { icon: Briefcase, title: "Find OJT placements", text: "Browse company openings by department and course, then contact employers directly." },
      { icon: Clock3, title: "Track hours & requirements", text: "Log attendance, submit narrative reports, and complete OJT requirements in one place." },
      { icon: MessagesSquare, title: "Stay connected", text: "Students and supervisors message and exchange feedback in real time." },
    ],
    tagline: "Connecting students and companies across every department.",
  },
};

export default function AuthShell({ children, role = "intern" }) {
  const meta = ROLE_META[role] || ROLE_META.intern;
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Marketing panel */}
      <div className={`relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex ${meta.gradient}`}>
        <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E)]" />
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/20 text-white shadow-lg ring-2 ring-white/40 backdrop-blur">
            <GraduationCap size={26} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-lg font-extrabold tracking-tight">{APP_NAME}</p>
            <p className="text-xs text-white/80">{APP_TAGLINE}</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-extrabold leading-tight">{meta.tagline}</h2>
          <div className="mt-8 space-y-4">
            {meta.highlights.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/15 backdrop-blur">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-white/70">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-sm text-white/70">
          <CheckCircle2 size={16} />
          Secure, role-based access to InternTrack.
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-slate-50 p-6 sm:p-10">
        <div className="w-full max-w-md animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
