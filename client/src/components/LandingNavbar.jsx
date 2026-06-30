import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { GraduationCap, Menu, X } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "../constants.js";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#workflow", label: "Workflow" },
  { href: "#dashboards", label: "Dashboards" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { hash } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href) => {
    setMobileOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-slate-200/70 bg-white/95 shadow-sm backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-lg shadow-blue-200 ring-2 ring-white/70 transition-all duration-300 ${scrolled ? "bg-gradient-to-br from-blue-600 to-cyan-500" : "bg-gradient-to-br from-blue-600 to-cyan-500"}`}>
            <GraduationCap size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className={`text-lg font-extrabold leading-tight transition-colors ${scrolled ? "text-slate-900" : "text-slate-900"}`}>{APP_NAME}</h1>
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${scrolled ? "text-slate-400" : "text-slate-500"}`}>{APP_TAGLINE}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          {LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className={`relative px-3 py-2 transition-colors ${
                hash === link.href ? "text-blue-600" : scrolled ? "text-slate-600 hover:text-blue-600" : "text-slate-600 hover:text-blue-600"
              }`}
            >
              {link.label}
              <span className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-blue-600 transition-transform ${hash === link.href ? "scale-x-100" : "scale-x-0"}`} />
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${scrolled ? "text-slate-600 hover:bg-slate-100" : "text-slate-700 hover:bg-white/50"}`}>Sign in</Link>
          <Link to="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:scale-105">Get Started</Link>
        </div>

        <button onClick={() => setMobileOpen((v) => !v)} className="grid h-10 w-10 place-items-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`overflow-hidden transition-all duration-300 md:hidden ${mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md">
          <nav className="flex flex-col gap-2">
            {LINKS.map((link) => (
              <button key={link.href} onClick={() => scrollTo(link.href)} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600">
                {link.label}
              </button>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Sign in</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white text-center hover:bg-blue-700">Get Started</Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
