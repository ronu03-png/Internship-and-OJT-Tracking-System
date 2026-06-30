import { Loader2, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

// Reveal-on-scroll wrapper. Fades + slides its children into view the first
// time they enter the viewport, using a lightweight IntersectionObserver.
export function Reveal({ children, className = "", delay = 0, as: Tag = "div" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700 ring-amber-200",
  submitted: "bg-sky-100 text-sky-700 ring-sky-200",
  approved: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  accepted: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  rejected: "bg-rose-100 text-rose-700 ring-rose-200",
  declined: "bg-rose-100 text-rose-700 ring-rose-200",
  needs_revision: "bg-orange-100 text-orange-700 ring-orange-200",
  open: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  closed: "bg-slate-100 text-slate-600 ring-slate-200",
  active: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  inactive: "bg-slate-100 text-slate-600 ring-slate-200",
};

const STATUS_DOTS = {
  pending: "bg-amber-500",
  submitted: "bg-sky-500",
  approved: "bg-emerald-500",
  accepted: "bg-emerald-500",
  rejected: "bg-rose-500",
  declined: "bg-rose-500",
  needs_revision: "bg-orange-500",
  open: "bg-emerald-500",
  closed: "bg-slate-400",
  active: "bg-emerald-500",
  inactive: "bg-slate-400",
};

const STATUS_LABELS = {
  pending: "Pending",
  submitted: "Submitted",
  approved: "Approved",
  accepted: "Accepted",
  rejected: "Rejected",
  declined: "Declined",
  needs_revision: "Needs revision",
  open: "Open",
  closed: "Closed",
  active: "Active",
  inactive: "Inactive",
};

export function Badge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        STATUS_STYLES[status] || "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[status] || "bg-slate-400"}`} />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

const AVATAR_PALETTE = [
  "from-brand-500 to-accent-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-indigo-600",
];

export function Avatar({ name = "", size = "md" }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const idx = (name.charCodeAt(0) || 0) % AVATAR_PALETTE.length;
  const sizes = {
    sm: "h-9 w-9 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-14 w-14 text-base",
  };
  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-bold text-white shadow-soft ${AVATAR_PALETTE[idx]} ${sizes[size]}`}
    >
      {initials || "?"}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sub, tone = "brand" }) {
  const tones = {
    brand: "bg-brand-50 text-brand-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    accent: "bg-accent-50 text-accent-600",
  };
  return (
    <div className="card group relative flex items-center gap-4 overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow">
      <div
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${tones[tone]}`}
      >
        <Icon size={24} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        {sub && <p className="truncate text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

export function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
      <Loader2 className="animate-spin text-brand-500" size={20} />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {Icon && (
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
          <Icon size={30} />
        </div>
      )}
      <p className="font-semibold text-slate-600">{title}</p>
      {hint && <p className="max-w-xs text-sm text-slate-400">{hint}</p>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm animate-fade-in sm:items-center"
      onClick={onClose}
    >
      <div
        className="card my-auto flex max-h-[calc(100vh-2rem)] w-full max-w-lg animate-scale-in flex-col p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>
        <div className="-mr-2 min-h-0 space-y-4 overflow-y-auto pr-2">{children}</div>
        {footer && <div className="mt-6 flex shrink-0 flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export function ProgressBar({ value = 0, showLabel = true, size = "sm" }) {
  const pct = Math.min(100, Math.max(0, value));
  const color =
    pct === 0
      ? "bg-slate-200"
      : pct < 31
      ? "bg-amber-400"
      : pct < 71
      ? "bg-emerald-400"
      : "bg-emerald-600";
  const height = size === "md" ? "h-3" : "h-2.5";
  return (
    <div className="flex items-center gap-3">
      <div className={`w-full overflow-hidden rounded-full bg-slate-100 ${height}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-8 shrink-0 text-right text-xs font-semibold text-slate-600">
          {pct}%
        </span>
      )}
    </div>
  );
}
