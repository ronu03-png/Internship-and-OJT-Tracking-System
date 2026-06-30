import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { GraduationCap, Shield, Users, Briefcase, AlertCircle, ArrowLeft, CheckCircle2, UserPlus, Building2, School } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import AuthShell from "../components/AuthShell.jsx";
import { APP_NAME } from "../constants.js";

const ROLE_CONFIG = {
  intern: {
    key: "intern",
    icon: GraduationCap,
    title: "Intern / Student",
    welcome: "Start your internship journey with InternTrack.",
    subtitle: "Create your student account to find OJT placements and track progress.",
    gradient: "from-blue-600 via-cyan-600 to-blue-700",
    text: "text-blue-600",
    light: "bg-blue-50",
    primary: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300",
    accent: "cyan",
    illustration: (
      <svg viewBox="0 0 200 160" className="h-full w-full opacity-90">
        <defs>
          <linearGradient id="internGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle cx="40" cy="40" r="24" fill="url(#internGrad)" opacity="0.2" />
        <circle cx="160" cy="120" r="32" fill="url(#internGrad)" opacity="0.15" />
        <rect x="70" y="60" width="80" height="56" rx="8" fill="#ffffff" opacity="0.9" />
        <rect x="80" y="72" width="60" height="6" rx="3" fill="#38bdf8" />
        <rect x="80" y="84" width="40" height="6" rx="3" fill="#bae6fd" />
        <rect x="80" y="96" width="50" height="6" rx="3" fill="#bae6fd" />
        <circle cx="150" cy="50" r="10" fill="#fbbf24" />
        <path d="M50 130l20-20 16 16 30-30 34 34" stroke="#38bdf8" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    ),
    fields: [
      { key: "student_id", label: "Student ID", type: "text", required: true, half: true },
      { key: "full_name", label: "Full Name", type: "text", required: true, half: true },
      { key: "course", label: "Course", type: "text", required: true, half: true },
      { key: "year_level", label: "Year Level", type: "text", required: true, half: true },
      { key: "section", label: "Section", type: "text", required: true, half: true },
      { key: "email", label: "School Email", type: "email", required: true, half: true },
      { key: "phone", label: "Contact Number", type: "tel", required: false, half: true },
      { key: "address", label: "Address", type: "text", required: false },
      { key: "password", label: "Password", type: "password", required: true, half: true },
      { key: "confirm_password", label: "Confirm Password", type: "password", required: true, half: true },
    ],
  },
  supervisor: {
    key: "supervisor",
    icon: Briefcase,
    title: "Company Supervisor",
    welcome: "Monitor and mentor future professionals.",
    subtitle: "Register to review intern attendance, reports, and provide evaluations.",
    gradient: "from-emerald-700 via-teal-700 to-emerald-800",
    text: "text-emerald-700",
    light: "bg-emerald-50",
    primary: "bg-emerald-700 hover:bg-emerald-800 focus:ring-emerald-300",
    accent: "emerald",
    illustration: (
      <svg viewBox="0 0 200 160" className="h-full w-full opacity-90">
        <defs>
          <linearGradient id="superGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
        <circle cx="30" cy="30" r="22" fill="url(#superGrad)" opacity="0.15" />
        <circle cx="170" cy="130" r="28" fill="url(#superGrad)" opacity="0.15" />
        <rect x="55" y="50" width="90" height="70" rx="10" fill="#ffffff" opacity="0.95" />
        <circle cx="85" cy="78" r="12" fill="#d1fae5" />
        <circle cx="125" cy="78" r="12" fill="#ccfbf1" />
        <circle cx="105" cy="98" r="12" fill="#10b981" opacity="0.2" />
        <rect x="75" y="120" width="50" height="8" rx="4" fill="#10b981" />
        <path d="M150 60l16 16-16 16" stroke="#10b981" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    fields: [
      { key: "employee_id", label: "Employee ID", type: "text", required: true, half: true },
      { key: "full_name", label: "Full Name", type: "text", required: true, half: true },
      { key: "company_name", label: "Company", type: "text", required: true, half: true },
      { key: "department", label: "Department", type: "text", required: true, half: true },
      { key: "position", label: "Position", type: "text", required: true, half: true },
      { key: "email", label: "Email", type: "email", required: true, half: true },
      { key: "phone", label: "Phone Number", type: "tel", required: false, half: true },
      { key: "password", label: "Password", type: "password", required: true, half: true },
      { key: "confirm_password", label: "Confirm Password", type: "password", required: true, half: true },
    ],
  },
  coordinator: {
    key: "coordinator",
    icon: Users,
    title: "OJT Coordinator",
    welcome: "Coordinate internship programs efficiently.",
    subtitle: "Create a coordinator account to manage students, companies, and placements.",
    gradient: "from-violet-700 via-indigo-700 to-violet-800",
    text: "text-violet-700",
    light: "bg-violet-50",
    primary: "bg-violet-700 hover:bg-violet-800 focus:ring-violet-300",
    accent: "violet",
    illustration: (
      <svg viewBox="0 0 200 160" className="h-full w-full opacity-90">
        <defs>
          <linearGradient id="coordGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <circle cx="35" cy="35" r="24" fill="url(#coordGrad)" opacity="0.15" />
        <circle cx="165" cy="125" r="30" fill="url(#coordGrad)" opacity="0.15" />
        <rect x="60" y="55" width="80" height="60" rx="8" fill="#ffffff" opacity="0.95" />
        <rect x="70" y="68" width="60" height="4" rx="2" fill="#8b5cf6" />
        <rect x="70" y="78" width="45" height="4" rx="2" fill="#c4b5fd" />
        <rect x="70" y="88" width="55" height="4" rx="2" fill="#c4b5fd" />
        <rect x="70" y="98" width="35" height="4" rx="2" fill="#c4b5fd" />
        <School x="145" y="50" size="32" className="text-violet-400" />
        <circle cx="145" cy="66" r="16" fill="#8b5cf6" opacity="0.2" />
      </svg>
    ),
    fields: [
      { key: "employee_id", label: "Employee ID", type: "text", required: true, half: true },
      { key: "full_name", label: "Full Name", type: "text", required: true, half: true },
      { key: "department", label: "Department", type: "text", required: true, half: true },
      { key: "institution", label: "Institution", type: "text", required: true, half: true },
      { key: "email", label: "Email", type: "email", required: true, half: true },
      { key: "phone", label: "Contact Number", type: "tel", required: false, half: true },
      { key: "password", label: "Password", type: "password", required: true, half: true },
      { key: "confirm_password", label: "Confirm Password", type: "password", required: true, half: true },
    ],
  },
  admin: {
    key: "admin",
    icon: Shield,
    title: "Administrator",
    welcome: "Manage the complete internship ecosystem.",
    subtitle: "Set up admin access to oversee users, analytics, and system security.",
    gradient: "from-slate-900 via-slate-800 to-slate-900",
    text: "text-slate-800",
    light: "bg-slate-100",
    primary: "bg-slate-900 hover:bg-slate-800 focus:ring-slate-300",
    accent: "amber",
    illustration: (
      <svg viewBox="0 0 200 160" className="h-full w-full opacity-90">
        <defs>
          <linearGradient id="adminGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="80" r="60" fill="url(#adminGrad)" opacity="0.15" />
        <rect x="70" y="55" width="60" height="50" rx="8" fill="#1e293b" opacity="0.95" />
        <rect x="80" y="68" width="40" height="4" rx="2" fill="#f59e0b" />
        <rect x="80" y="78" width="30" height="4" rx="2" fill="#94a3b8" />
        <rect x="80" y="88" width="35" height="4" rx="2" fill="#94a3b8" />
        <circle cx="140" cy="50" r="14" fill="#f59e0b" opacity="0.2" />
        <path d="M140 44v12M134 50h12" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M55 115l10-10 14 14 16-16 20 20" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    fields: [
      { key: "employee_id", label: "Administrator ID", type: "text", required: true, half: true },
      { key: "full_name", label: "Full Name", type: "text", required: true, half: true },
      { key: "username", label: "Username", type: "text", required: true, half: true },
      { key: "email", label: "Email", type: "email", required: true, half: true },
      { key: "security_question", label: "Security Question", type: "text", required: true },
      { key: "phone", label: "Contact Number", type: "tel", required: false, half: true },
      { key: "password", label: "Password", type: "password", required: true, half: true },
      { key: "confirm_password", label: "Confirm Password", type: "password", required: true, half: true },
    ],
  },
};

const INITIAL = {
  intern: { student_id: "", full_name: "", course: "", year_level: "", section: "", email: "", phone: "", address: "", password: "", confirm_password: "" },
  supervisor: { employee_id: "", full_name: "", company_name: "", department: "", position: "", email: "", phone: "", password: "", confirm_password: "" },
  coordinator: { employee_id: "", full_name: "", department: "", institution: "", email: "", phone: "", password: "", confirm_password: "" },
  admin: { employee_id: "", full_name: "", username: "", email: "", security_question: "", phone: "", password: "", confirm_password: "" },
};

export default function RegisterRole() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const { success: toastSuccess } = useToast();
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.intern;
  const Icon = config.icon;

  const [form, setForm] = useState(INITIAL[config.key]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, role: config.key };
      delete payload.confirm_password;
      await register(payload);
      setCreated(true);
      toastSuccess(`${config.title} account created successfully!`);
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell role={config.key}>
      <div className="mb-6">
        <Link to="/register" className={`mb-4 inline-flex items-center gap-1 text-xs font-semibold ${config.text} hover:underline`}>
          <ArrowLeft size={14} /> Back to account types
        </Link>
        <div className="mb-4 flex items-center gap-4 lg:hidden">
          <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${config.gradient} text-white shadow-lg`}>
            <Icon size={28} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{APP_NAME}</p>
            <h1 className="text-xl font-bold text-slate-900">{config.title}</h1>
          </div>
        </div>
        <div className="hidden items-center gap-4 lg:flex">
          <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${config.gradient} text-white shadow-lg`}>
            <Icon size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{config.welcome}</h1>
            <p className="mt-1 text-sm text-slate-500">{config.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 hidden h-36 justify-center lg:flex">
        <div className={`w-48 rounded-2xl ${config.light} p-4`}>{config.illustration}</div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {error && (
          <p className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-600 ring-1 ring-inset ring-rose-100">
            <AlertCircle size={16} /> {error}
          </p>
        )}
        {created && (
          <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-600 ring-1 ring-inset ring-emerald-100">
            <CheckCircle2 size={16} /> Account created successfully. Redirecting...
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {config.fields.map((field) => (
            <div key={field.key} className={field.half ? "" : "sm:col-span-2"}>
              <label className="label">{field.label}{field.required && <span className="text-rose-500">*</span>}</label>
              <input
                className="input"
                type={field.type}
                value={form[field.key]}
                onChange={set(field.key)}
                required={field.required}
                placeholder={field.placeholder || ""}
              />
            </div>
          ))}
        </div>

        <button className={`mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 ${config.primary}`} disabled={loading}>
          {loading ? "Creating account..." : `Create ${config.title} account`}
        </button>
        <p className="text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className={`font-semibold ${config.text} hover:underline`}>Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
