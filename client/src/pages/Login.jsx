import { useEffect, useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { GraduationCap, Shield, Users, Briefcase, AlertCircle, LogIn, ChevronDown, X, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import AuthShell from "../components/AuthShell.jsx";
import { Avatar } from "../components/ui.jsx";

const SAVED_KEY = "its_saved_accounts";
const LEGACY_KEY = "its_saved_account";

const ROLE_CONFIG = {
  admin: {
    icon: Shield,
    title: "Administrator",
    welcome: "Executive Dashboard",
    subtitle: "Secure access to system administration, analytics, and audit controls.",
    gradient: "from-slate-900 via-slate-800 to-slate-900",
    accent: "amber",
    primary: "bg-slate-900 hover:bg-slate-800 focus:ring-slate-300",
    text: "text-slate-900",
    light: "bg-amber-50",
  },
  coordinator: {
    icon: Users,
    title: "OJT Coordinator",
    welcome: "Academic Coordination",
    subtitle: "Manage students, placements, companies, and monitor OJT progress.",
    gradient: "from-violet-700 via-indigo-700 to-violet-800",
    accent: "violet",
    primary: "bg-violet-700 hover:bg-violet-800 focus:ring-violet-300",
    text: "text-violet-700",
    light: "bg-violet-50",
  },
  supervisor: {
    icon: Briefcase,
    title: "Company Supervisor",
    welcome: "Supervisor Portal",
    subtitle: "Review attendance, reports, requirements, and evaluate intern performance.",
    gradient: "from-emerald-700 via-teal-700 to-emerald-800",
    accent: "emerald",
    primary: "bg-emerald-700 hover:bg-emerald-800 focus:ring-emerald-300",
    text: "text-emerald-700",
    light: "bg-emerald-50",
  },
  intern: {
    icon: GraduationCap,
    title: "Intern / Student",
    welcome: "Student Workspace",
    subtitle: "Track your OJT hours, submit journals and reports, and view feedback.",
    gradient: "from-blue-600 via-cyan-600 to-blue-700",
    accent: "blue",
    primary: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300",
    text: "text-blue-600",
    light: "bg-blue-50",
  },
};

function encode(value) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(value))));
}
function decode(raw) {
  return JSON.parse(decodeURIComponent(escape(atob(raw))));
}
function loadSavedAccounts() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (raw) {
      const parsed = decode(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const account = decode(legacy);
      const migrated = account ? [account] : [];
      localStorage.setItem(SAVED_KEY, encode(migrated));
      localStorage.removeItem(LEGACY_KEY);
      return migrated;
    }
    return [];
  } catch {
    localStorage.removeItem(SAVED_KEY);
    localStorage.removeItem(LEGACY_KEY);
    return [];
  }
}
function persistAccounts(accounts) {
  localStorage.setItem(SAVED_KEY, encode(accounts));
}
function upsertAccount(accounts, account) {
  const next = accounts.filter((a) => a.email !== account.email);
  next.unshift(account);
  persistAccounts(next);
  return next;
}
function removeAccount(accounts, email) {
  const next = accounts.filter((a) => a.email !== email);
  persistAccounts(next);
  return next;
}

export default function Login() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { success } = useToast();
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.intern;
  const Icon = config.icon;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (user) { navigate("/"); return; }
    setAccounts(loadSavedAccounts());
  }, [user, navigate]);

  const doLogin = async (loginEmail, loginPassword) => {
    setError("");
    setLoading(true);
    try {
      const user = await login(loginEmail, loginPassword);
      if (role && user.role !== role) {
        setError(`This account is not a ${config.title}. Please select the correct role.`);
        setLoading(false);
        return;
      }
      if (remember) {
        const updated = upsertAccount(loadSavedAccounts(), {
          email: loginEmail,
          password: loginPassword,
          full_name: user?.full_name,
          role: user?.role,
        });
        setAccounts(updated);
      }
      success(`Welcome back${user?.full_name ? `, ${user.full_name}` : ""}!`);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const submit = (e) => { e.preventDefault(); doLogin(email, password); };
  const removeSaved = (savedEmail) => { setAccounts((prev) => removeAccount(prev, savedEmail)); };

  const filteredAccounts = useMemo(() => accounts.filter((a) => !role || a.role === role || !a.role), [accounts, role]);

  return (
    <AuthShell role={role}>
      <div className="mb-6">
        <Link to="/login" className={`mb-4 inline-flex items-center gap-1 text-xs font-semibold ${config.text} hover:underline`}>
          <ArrowLeft size={14} /> Back to role selection
        </Link>
        <div className={`mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${config.gradient} text-white shadow-lg`}>
          <Icon size={28} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{config.welcome}</h1>
        <p className="mt-1 text-sm text-slate-500">{config.subtitle}</p>
      </div>

      {filteredAccounts.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50"
          >
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${config.light} ${config.text}`}>
              <Users size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">{filteredAccounts.length} saved {filteredAccounts.length === 1 ? "account" : "accounts"}</p>
              <p className="truncate text-xs text-slate-400">{expanded ? "Pick an account to sign in quickly" : "Tap to choose an account"}</p>
            </div>
            <ChevronDown size={20} className={`shrink-0 text-slate-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </button>
          {expanded && (
            <div className="space-y-2 border-t border-slate-100 p-3 animate-fade-in">
              {filteredAccounts.map((acc) => (
                <div key={acc.email} className={`group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-${config.accent}-300 hover:${config.light}`}>
                  <button type="button" onClick={() => doLogin(acc.email, acc.password)} disabled={loading} className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:opacity-60">
                    <Avatar name={acc.full_name || acc.email} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{acc.full_name || acc.email}</p>
                      <p className="truncate text-xs text-slate-400">{acc.email}</p>
                    </div>
                    <span className={`hidden items-center gap-1 text-xs font-semibold ${config.text} sm:flex`}><LogIn size={15} /> Sign in</span>
                  </button>
                  <button type="button" onClick={() => removeSaved(acc.email)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"><X size={16} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        {error && (
          <p className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-600 ring-1 ring-inset ring-rose-100">
            <AlertCircle size={16} /> {error}
          </p>
        )}
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        <label className="flex items-center gap-2.5 text-sm text-slate-600">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
          Remember me on this device
        </label>
        <button className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 ${config.primary}`} disabled={loading}>
          {loading ? "Signing in..." : `Sign in as ${config.title}`}
        </button>
        <p className="text-center text-sm text-slate-500">
          No account? <Link to="/register" className={`font-semibold ${config.text} hover:underline`}>Create one</Link>
        </p>
      </form>
    </AuthShell>
  );
}
