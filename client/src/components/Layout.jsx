import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import {
  LayoutDashboard,
  CalendarClock,
  FileText,
  MessagesSquare,
  Users,
  GraduationCap,
  Briefcase,
  FileCheck2,
  FileCheck,
  Calendar as CalendarIcon,
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
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { Avatar } from "./ui.jsx";
import { APP_NAME, APP_TAGLINE } from "../constants.js";
import { Link } from "react-router-dom";

const INTERN_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/openings", label: "Find OJT", icon: Briefcase },
  { to: "/attendance", label: "Attendance", icon: CalendarClock },
  { to: "/journals", label: "Daily Journal", icon: BookOpen },
  { to: "/weekly-reports", label: "Weekly Report", icon: FileText },
  { to: "/monthly-reports", label: "Monthly Report", icon: CalendarIcon },
  { to: "/reports", label: "Narrative Reports", icon: FileText },
  { to: "/final-reports", label: "Final Report", icon: FileCheck },
  { to: "/requirements", label: "Requirements", icon: FileCheck2 },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/messages", label: "Messages", icon: MessagesSquare },
];

const SUPERVISOR_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/openings", label: "OJT Openings", icon: Briefcase },
  { to: "/interns", label: "My Interns", icon: Users },
  { to: "/attendance", label: "Attendance", icon: CalendarClock },
  { to: "/journals", label: "Journal Review", icon: BookOpen },
  { to: "/weekly-reports", label: "Weekly Reports", icon: FileText },
  { to: "/monthly-reports", label: "Monthly Reports", icon: CalendarIcon },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/final-reports", label: "Final Reports", icon: FileCheck },
  { to: "/requirements", label: "Requirements", icon: FileCheck2 },
  { to: "/evaluations", label: "Evaluations", icon: Star },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/messages", label: "Messages", icon: MessagesSquare },
];

const COORDINATOR_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/students", label: "Students", icon: Users },
  { to: "/companies", label: "Companies", icon: Building2 },
  { to: "/placements", label: "Placements", icon: Briefcase },
  { to: "/attendance", label: "Attendance", icon: CalendarClock },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/requirements", label: "Requirements", icon: FileCheck2 },
  { to: "/messages", label: "Messages", icon: MessagesSquare },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

const ADMIN_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/users", label: "Users", icon: Shield },
  { to: "/students", label: "Students", icon: Users },
  { to: "/companies", label: "Companies", icon: Building2 },
  { to: "/placements", label: "Placements", icon: Briefcase },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/audit-logs", label: "Audit Logs", icon: BookOpen },
  { to: "/settings", label: "Settings", icon: Settings },
];

function Brand() {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg ring-2 ring-white/70">
        <GraduationCap size={24} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-base font-extrabold leading-tight tracking-tight text-slate-800">{APP_NAME}</p>
        <p className="text-[11px] font-medium leading-tight text-slate-400">{APP_TAGLINE}</p>
      </div>
    </div>
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
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`absolute left-0 h-6 w-1 rounded-r-full bg-brand-600 transition-all duration-300 ${
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
    "--brand-50": "#f5f5f4",
    "--brand-100": "#e7e5e4",
    "--brand-200": "#d6d3d1",
    "--brand-300": "#a8a29e",
    "--brand-400": "#78716c",
    "--brand-500": "#57534e",
    "--brand-600": "#44403c",
    "--brand-700": "#292524",
    "--brand-800": "#1c1917",
    "--brand-900": "#0c0a09",
  },
  coordinator: {
    "--brand-50": "#f5f3ff",
    "--brand-100": "#ede9fe",
    "--brand-200": "#ddd6fe",
    "--brand-300": "#c4b5fd",
    "--brand-400": "#a78bfa",
    "--brand-500": "#8b5cf6",
    "--brand-600": "#7c3aed",
    "--brand-700": "#6d28d9",
    "--brand-800": "#5b21b6",
    "--brand-900": "#4c1d95",
  },
  supervisor: {
    "--brand-50": "#ecfdf5",
    "--brand-100": "#d1fae5",
    "--brand-200": "#a7f3d0",
    "--brand-300": "#6ee7b7",
    "--brand-400": "#34d399",
    "--brand-500": "#10b981",
    "--brand-600": "#059669",
    "--brand-700": "#047857",
    "--brand-800": "#065f46",
    "--brand-900": "#064e3b",
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
    api.get("/notifications/unread").then((res) => setUnread(res.data.count)).catch(() => {});
    const interval = setInterval(() => {
      api.get("/notifications/unread").then((res) => setUnread(res.data.count)).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const navByRole = {
    admin: ADMIN_NAV,
    coordinator: COORDINATOR_NAV,
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
    coordinator: "Coordinator Portal",
    supervisor: "Supervisor Portal",
    intern: "Student Portal",
  };
  const roleLine = `${portalLabel[user?.role] || "Portal"}${
    user?.department ? ` · ${user.department}` : ""
  }`;

  return (
    <div className="flex min-h-screen bg-slate-50" style={roleVars}>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-5 md:flex">
        <div className="mb-8 mt-1">
          <Brand />
        </div>
        <NavItems nav={nav} />
        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
            <Avatar name={user?.full_name || ""} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{user?.full_name}</p>
              <p className="truncate text-xs capitalize text-slate-400">{roleLine}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
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
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-slate-200 bg-white p-5 animate-slide-up">
            <div className="mb-8 mt-1 flex items-center justify-between">
              <Brand />
              <button onClick={() => setMobileOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <NavItems nav={nav} onNavigate={() => setMobileOpen(false)} />
            <button
              onClick={handleLogout}
              className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-800">{user?.full_name}</p>
              <p className="text-xs capitalize text-slate-400">{roleLine}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/notifications" className="relative grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200">
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
        <main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div key={location.pathname} className="page-transition">{children}</div>
        </main>
      </div>
    </div>
  );
}
