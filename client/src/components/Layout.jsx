import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import {
  LayoutDashboard,
  CalendarClock,
  FileText,
  Users,
  GraduationCap,
  Briefcase,
  FileCheck2,
  LogOut,
  Menu,
  X,
  Building2,
  Settings,
  Shield,
  Megaphone,
  CalendarDays,
  BarChart3,
  BookOpen,
  Star,
  Bell,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { Avatar } from "./ui.jsx";
import { APP_NAME, APP_TAGLINE } from "../constants.js";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const INTERN_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/journals", label: "Daily Journal", icon: BookOpen },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/requirements", label: "Requirements", icon: FileCheck2 },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/profile", label: "Profile", icon: User },
];

const SUPERVISOR_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/interns", label: "OJT Students", icon: Users },
  { to: "/journals", label: "Journal Review", icon: BookOpen },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/requirements", label: "Requirements", icon: FileCheck2 },
  { to: "/evaluations", label: "Evaluations", icon: Star },
  { to: "/students", label: "Students", icon: Users },
  { to: "/companies", label: "Schools", icon: Building2 },
  { to: "/placements", label: "Placements", icon: Briefcase },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/profile", label: "Profile", icon: User },
];

const ADMIN_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/users", label: "Users", icon: Shield },
  { to: "/students", label: "Students", icon: Users },
  { to: "/attendance", label: "Attendance", icon: CalendarClock },
  { to: "/journals", label: "Journal Review", icon: BookOpen },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/requirements", label: "Requirements", icon: FileCheck2 },
  { to: "/evaluations", label: "Evaluations", icon: Star },
  { to: "/companies", label: "Schools", icon: Building2 },
  { to: "/placements", label: "Placements", icon: Briefcase },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/audit-logs", label: "Audit Logs", icon: BookOpen },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

function Brand({ dark = true }) {
  return (
    <Link to="/" className="flex items-center gap-3 px-2">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg ring-2 ring-white/70">
        <GraduationCap size={24} strokeWidth={2.5} />
      </div>
      <div>
        <p className={`text-base font-extrabold leading-tight tracking-tight ${dark ? "text-white" : "text-slate-800"}`}>{APP_NAME}</p>
        <p className={`text-[11px] font-medium leading-tight ${dark ? "text-white/70" : "text-slate-400"}`}>{APP_TAGLINE}</p>
      </div>
    </Link>
  );
}

function NavItems({ nav, onNavigate }) {
  return (
    <nav className="flex-1 space-y-1">
      {nav.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `nav-link group ${
              isActive
                ? "bg-brand-50 text-brand-700 shadow-soft"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`absolute left-0 h-6 w-1 rounded-r-full bg-brand-500 transition-all duration-300 ${
                  isActive ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
                }`}
              />
              <Icon
                size={18}
                className={`transition-transform duration-200 ${
                  isActive ? "scale-110" : "group-hover:scale-110"
                }`}
              />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

const ROLE_CSS_VARS = {
  admin: {
    "--brand-50": "#eff6ff",
    "--brand-100": "#dbeafe",
    "--brand-200": "#bfdbfe",
    "--brand-300": "#93c5fd",
    "--brand-400": "#60a5fa",
    "--brand-500": "#3b82f6",
    "--brand-600": "#2563eb",
    "--brand-700": "#1d4ed8",
    "--brand-800": "#1e40af",
    "--brand-900": "#1e3a8a",
  },
  supervisor: {
    "--brand-50": "#eff6ff",
    "--brand-100": "#dbeafe",
    "--brand-200": "#bfdbfe",
    "--brand-300": "#93c5fd",
    "--brand-400": "#60a5fa",
    "--brand-500": "#3b82f6",
    "--brand-600": "#2563eb",
    "--brand-700": "#1d4ed8",
    "--brand-800": "#1e40af",
    "--brand-900": "#1e3a8a",
  },
  intern: {
    "--brand-50": "#eff6ff",
    "--brand-100": "#dbeafe",
    "--brand-200": "#bfdbfe",
    "--brand-300": "#93c5fd",
    "--brand-400": "#60a5fa",
    "--brand-500": "#3b82f6",
    "--brand-600": "#2563eb",
    "--brand-700": "#1d4ed8",
    "--brand-800": "#1e40af",
    "--brand-900": "#1e3a8a",
  },
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const roleVars = ROLE_CSS_VARS[user?.role] || ROLE_CSS_VARS.intern;

  useEffect(() => {
    if (!user) return;
    const fetchUnread = () => api.get("/notifications/unread").then((res) => setUnread(res.data.count)).catch(() => {});
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    const handleUpdate = () => fetchUnread();
    window.addEventListener("notifications-updated", handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications-updated", handleUpdate);
    };
  }, [user]);

  const navByRole = {
    admin: ADMIN_NAV,
    supervisor: SUPERVISOR_NAV,
    intern: INTERN_NAV,
  };
  const nav = navByRole[user?.role] || INTERN_NAV;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const portalLabel = {
    admin: "Administrator Portal",
    supervisor: "Supervisor Portal",
    intern: "Student Portal",
  };
  const roleLine = `${portalLabel[user?.role] || "Portal"}${
    user?.department ? ` · ${user.department}` : ""
  }`;

  return (
    <>
      <style>{`:root { ${Object.entries(roleVars).map(([k, v]) => `${k}: ${v};`).join(" ")} }`}</style>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        {/* Desktop sidebar - fixed height, scrollable only on hover when content overflows */}
      <aside className="hidden w-64 flex-col border-r-2 border-blue-100 bg-white p-5 shadow-xl md:flex h-screen overflow-y-hidden hover:overflow-y-auto">
        <div className="mb-8 mt-1">
          <Brand dark={false} />
        </div>
        <NavItems nav={nav} />
        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-100 px-3 py-2.5">
            <Avatar name={user?.full_name || ""} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{user?.full_name}</p>
              <p className="truncate text-xs capitalize text-slate-500">{roleLine}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r-2 border-blue-100 bg-white p-5 shadow-2xl animate-slide-up">
            <div className="mb-8 mt-1 flex items-center justify-between">
              <Brand dark={false} />
              <button onClick={() => setMobileOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <NavItems nav={nav} onNavigate={() => setMobileOpen(false)} />
            <button
              onClick={handleLogout}
              className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-white/30 bg-blue-600 px-4 py-3 shadow-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg text-white/70 hover:bg-white/10 md:hidden"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-sm font-semibold text-white">{user?.full_name}</p>
              <p className="text-xs capitalize text-white/70">{roleLine}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/notifications" className="relative grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <Avatar name={user?.full_name || ""} size="sm" />
          </div>
        </header>
        <main className="relative mx-auto w-full max-w-6xl flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 30, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  </>
  );
}
