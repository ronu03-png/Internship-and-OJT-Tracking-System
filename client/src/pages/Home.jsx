import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Briefcase, Users, BarChart3, Shield, Calendar, FileCheck, MessageSquare, Bell, ArrowRight, CheckCircle2, Star, ChevronDown, Mail, Phone, MapPin, Send, CheckSquare, FileText, Award, Building2, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { APP_NAME, APP_TAGLINE } from "../constants.js";
import api from "../api";
import LandingNavbar from "../components/LandingNavbar.jsx";
import ScrollToTop from "../components/ScrollToTop.jsx";

const FEATURES = [
  { icon: Briefcase, title: "OJT Placement", desc: "Connect students with partner companies and city offices through a digital job board." },
  { icon: Calendar, title: "Attendance Tracking", desc: "Log time-in/out with QR, GPS, and selfie verification for accurate hour records." },
  { icon: FileCheck, title: "Reports & Journals", desc: "Submit daily journals, weekly, monthly, and final reports for supervisor review." },
  { icon: Users, title: "Supervisor Evaluation", desc: "Rate interns across multiple competencies and generate overall performance scores." },
  { icon: MessageSquare, title: "Built-in Messaging", desc: "Communicate directly between students, supervisors, coordinators, and administrators." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Monitor attendance, requirements, hours, and evaluations in real time." },
];

const TESTIMONIALS = [
  { name: "Prof. Elena Rodriguez", role: "OJT Coordinator", text: "InternTrack transformed how we manage OJT. Everything is centralized and transparent." },
  { name: "Mr. Juan Santos", role: "Company Supervisor", text: "Reviewing attendance, reports, and evaluations is now faster and more organized." },
  { name: "Maria Dela Cruz", role: "Student Intern", text: "I can track my hours, submit reports, and see my progress all in one place." },
];

const FAQS = [
  { q: "Who can use InternTrack?", a: "Students, company supervisors, OJT coordinators, and system administrators." },
  { q: "How do students log attendance?", a: "Students can time-in and time-out via the attendance module. QR, GPS, and selfie verification can be enabled." },
  { q: "Can reports be exported?", a: "Yes. Reports can be exported to PDF or Excel for submission and record keeping." },
  { q: "Is the system mobile-friendly?", a: "Yes. InternTrack is fully responsive and works on desktop, tablet, and mobile browsers." },
];

const WORKFLOW = [
  { icon: UserPlus, title: "Create Account", desc: "Choose your role and register in seconds." },
  { icon: ArrowRight, title: "Login", desc: "Access your personalized dashboard." },
  { icon: CheckSquare, title: "Submit Requirements", desc: "Upload MOA, medical, and other documents." },
  { icon: Building2, title: "Company Assignment", desc: "Get matched with a partner organization." },
  { icon: Calendar, title: "Daily Attendance", desc: "Log time-in and time-out accurately." },
  { icon: FileText, title: "Journal Submission", desc: "Record daily tasks and learning." },
  { icon: Star, title: "Supervisor Evaluation", desc: "Receive performance ratings and feedback." },
  { icon: Award, title: "Internship Completion", desc: "Complete requirements and generate records." },
  { icon: FileCheck, title: "Certificate Generation", desc: "Download completion certificates." },
];

const DASHBOARDS = [
  { role: "Intern / Student", color: "blue", stats: ["486 required hours", "12 days logged", "3 reports submitted"], items: ["Daily Journal", "Attendance", "Find OJT"], image: "intern" },
  { role: "Company Supervisor", color: "emerald", stats: ["5 interns", "8 pending reports", "2 evaluations"], items: ["Review Attendance", "Evaluate Interns", "Approve Reports"], image: "supervisor" },
  { role: "OJT Coordinator", color: "violet", stats: ["248 students", "38 companies", "192 placements"], items: ["Manage Students", "Companies", "Placements"], image: "coordinator" },
  { role: "Administrator", color: "slate", stats: ["312 users", "4 roles", "1,240 audit logs"], items: ["User Management", "Analytics", "Audit Logs"], image: "admin" },
];

const PARTNERS = ["City Government", "Tech Innovators", "Global Solutions", "EduCloud", "Digital PH", "Metro Systems", "NextGen IT", "Creative Agency"];

const COUNTER_STATS = [
  { label: "Interns", value: 248 },
  { label: "Partner Companies", value: 38 },
  { label: "Coordinators", value: 12 },
  { label: "Hours Tracked", value: 124650 },
];

function AnimatedCounter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const step = Math.max(1, Math.floor(value / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { start = value; clearInterval(timer); }
      setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

function useReveal() {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [liveStats, setLiveStats] = useState(null);
  const [contact, setContact] = useState({ name: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);
  const partnersRef = useRef(null);
  useReveal();

  useEffect(() => {
    api.get("/stats/admin").then((res) => setLiveStats(res.data)).catch(() => setLiveStats({ student_count: 248, company_count: 38, pending_requirements: 21, pending_attendance: 0 }));
  }, []);

  if (user) { navigate("/"); return null; }

  const submitContact = (e) => {
    e.preventDefault();
    setContactSent(true);
    setContact({ name: "", email: "", message: "" });
    setTimeout(() => setContactSent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-sm animate-fade-in">
            <Bell size={14} /> Now accepting OJT applications for 2025-2026
          </div>
          <h2 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl reveal">
            Modern Internship and OJT <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Tracking System</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 reveal" style={{ transitionDelay: "100ms" }}>
            Connect students, companies, and coordinators in one powerful platform. Track attendance, reports, evaluations, and requirements with ease.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row reveal" style={{ transitionDelay: "200ms" }}>
            <Link to="/login" className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-blue-200 transition hover:bg-blue-700 hover:scale-105">
              Sign In <ArrowRight size={18} className="transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Live stats */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(liveStats ? [
            { label: "Total Interns", value: liveStats.student_count || 248 },
            { label: "Partner Companies", value: liveStats.company_count || 38 },
            { label: "Pending Requirements", value: liveStats.pending_requirements || 21 },
            { label: "Active Placements", value: liveStats.placement_count || 192 },
          ] : COUNTER_STATS).map((s, idx) => (
            <div key={s.label} className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 text-center shadow-sm backdrop-blur-sm reveal hover:-translate-y-1 transition-transform duration-300" style={{ transitionDelay: `${idx * 100}ms` }}>
              <p className="text-3xl font-extrabold text-slate-900"><AnimatedCounter value={s.value} /></p>
              <p className="mt-1 text-sm font-medium text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center reveal">
            <h3 className="text-3xl font-bold text-slate-900">Everything you need for OJT management</h3>
            <p className="mt-3 text-slate-600">A complete toolkit for students, supervisors, coordinators, and administrators.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, idx) => (
              <div key={f.title} className="group rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-lg hover:shadow-blue-100/50 reveal" style={{ transitionDelay: `${idx * 80}ms` }}>
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600 transition duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-3">
                  <f.icon size={24} />
                </div>
                <h4 className="mb-2 text-lg font-bold text-slate-900">{f.title}</h4>
                <p className="text-sm leading-relaxed text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-blue-600 px-4 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h3 className="text-3xl font-bold">Why choose InternTrack?</h3>
              <p className="mt-4 text-blue-100">Designed for Philippine universities and government partner offices, InternTrack simplifies every step of the OJT lifecycle.</p>
              <ul className="mt-8 space-y-4">
                {["Reduce paperwork and manual tracking", "Real-time visibility for coordinators", "Secure role-based access", "Export-ready reports and analytics", "Mobile-responsive design"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-blue-50">
                    <CheckCircle2 size={20} className="text-cyan-300" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[{icon: Shield, label: "Secure & Reliable"}, {icon: BarChart3, label: "Data-Driven Insights"}, {icon: Users, label: "Role-Based Access"}, {icon: FileCheck, label: "Paperless Workflow"}].map((b) => (
                <div key={b.label} className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
                  <b.icon size={28} className="mb-3 text-cyan-300" />
                  <p className="font-semibold">{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center reveal">
            <h3 className="text-3xl font-bold text-slate-900">How InternTrack works</h3>
            <p className="mt-3 text-slate-600">A simple, step-by-step journey from registration to completion.</p>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 hidden w-0.5 bg-gradient-to-b from-blue-200 to-cyan-200 md:block" />
            <div className="space-y-8">
              {WORKFLOW.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className={`relative flex items-start gap-6 reveal ${idx % 2 === 1 ? "md:flex-row-reverse" : ""}`} style={{ transitionDelay: `${idx * 80}ms` }}>
                    <div className="hidden flex-1 md:block" />
                    <div className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-200">
                      <Icon size={24} />
                    </div>
                    <div className="flex-1 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">{idx + 1}</span>
                        <h4 className="font-bold text-slate-900">{step.title}</h4>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="dashboards" className="bg-slate-900 px-4 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center reveal">
            <h3 className="text-3xl font-bold">Role-based dashboards</h3>
            <p className="mt-3 text-slate-400">Every user sees a tailored workspace designed for their responsibilities.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {DASHBOARDS.map((d, idx) => (
              <div key={d.role} className={`group rounded-2xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm transition hover:-translate-y-2 hover:border-${d.color}-500/50 hover:shadow-xl hover:shadow-${d.color}-900/20 reveal`} style={{ transitionDelay: `${idx * 100}ms` }}>
                <div className="mb-4 flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full bg-${d.color}-500`} />
                  <h4 className="font-bold">{d.role}</h4>
                </div>
                <div className="mb-5 grid grid-cols-3 gap-2">
                  {d.stats.map((stat) => (
                    <div key={stat} className="rounded-xl bg-slate-800 p-3 text-center">
                      <p className="text-xs text-slate-400">{stat}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-slate-800 p-4">
                  <div className="mb-3 h-2 w-1/2 rounded bg-slate-700" />
                  <div className="space-y-2">
                    {d.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                        <div className={`h-2 w-2 rounded-full bg-${d.color}-400`} /> {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Companies */}
      <section className="overflow-hidden border-y border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 text-center reveal">
          <p className="mb-6 text-sm font-semibold uppercase tracking-wider text-slate-400">Trusted by partner organizations</p>
        </div>
        <div ref={partnersRef} className="relative flex w-max animate-marquee gap-12 hover:[animation-play-state:paused]">
          {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((name, idx) => (
            <div key={`${name}-${idx}`} className="flex items-center gap-2 rounded-xl bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:scale-105 hover:bg-blue-50 hover:text-blue-600">
              <Building2 size={18} /> {name}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center reveal">
            <h3 className="text-3xl font-bold text-slate-900">What users say</h3>
            <p className="mt-3 text-slate-600">Hear from students, supervisors, and coordinators.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, idx) => (
              <div key={t.name} className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-lg reveal" style={{ transitionDelay: `${idx * 100}ms` }}>
                <div className="mb-4 flex text-amber-400">
                  {[1,2,3,4,5].map((i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="mb-4 text-sm italic text-slate-600">"{t.text}"</p>
                <p className="font-bold text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center reveal">
            <h3 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h3>
            <p className="mt-3 text-slate-600">Find quick answers to common questions.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 reveal transition hover:shadow-sm" style={{ transitionDelay: `${idx * 60}ms` }}>
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="flex w-full items-center justify-between text-left font-semibold text-slate-800">
                  {faq.q}
                  <span className={`transform transition-transform duration-300 ${openFaq === idx ? "rotate-180" : ""}`}><ChevronDown size={18} /></span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
                  <p className="text-sm text-slate-600">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center reveal">
            <h3 className="text-3xl font-bold text-slate-900">Get in touch</h3>
            <p className="mt-3 text-slate-600">Have questions? Reach out to the InternTrack team.</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm reveal">
              <h4 className="mb-4 text-lg font-bold text-slate-900">Send a message</h4>
              <form onSubmit={submitContact} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Name</label>
                    <input className="input" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input className="input" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea className="input min-h-[120px]" value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} required />
                </div>
                <button className="btn-primary flex w-full items-center justify-center gap-2">
                  <Send size={16} /> {contactSent ? "Message sent" : "Send message"}
                </button>
              </form>
            </div>
            <div className="space-y-4 reveal" style={{ transitionDelay: "100ms" }}>
              <div className="h-48 rounded-3xl bg-slate-200 p-4">
                <div className="flex h-full items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <div className="text-center">
                    <MapPin size={32} className="mx-auto mb-2" />
                    <p className="text-sm font-medium">Map placeholder</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <Mail size={20} className="mx-auto mb-2 text-blue-600" />
                  <p className="text-xs font-semibold text-slate-600">support@interntrack.edu</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <Phone size={20} className="mx-auto mb-2 text-blue-600" />
                  <p className="text-xs font-semibold text-slate-600">+63 912 345 6789</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <MapPin size={20} className="mx-auto mb-2 text-blue-600" />
                  <p className="text-xs font-semibold text-slate-600">University of Example Philippines</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-10 text-center text-white shadow-2xl shadow-blue-200 reveal">
          <h3 className="text-3xl font-bold">Ready to streamline your OJT program?</h3>
          <p className="mt-3 text-blue-50">Sign in now and experience the future of internship management.</p>
          <Link to="/login" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 font-bold text-blue-600 shadow-lg transition hover:bg-blue-50 hover:scale-105">
            Get Started Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md"><GraduationCap size={20} strokeWidth={2.5} /></div>
                <div>
                  <span className="text-lg font-extrabold leading-tight text-slate-900">{APP_NAME}</span>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{APP_TAGLINE}</p>
                </div>
              </div>
              <p className="mt-3 max-w-sm text-sm text-slate-500">A web-based internship and OJT placement tracking system for universities and partner organizations.</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Quick Links</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><Link to="/login" className="hover:text-blue-600">Sign In</Link></li>
                <li><a href="#features" className="hover:text-blue-600">Features</a></li>
                <li><a href="#contact" className="hover:text-blue-600">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Legal</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row">
            <p className="text-xs text-slate-400">© 2026 {APP_NAME}. All rights reserved.</p>
            <div className="flex items-center gap-4 text-slate-400">
              <a href="#" className="hover:text-blue-600"><Mail size={16} /></a>
              <a href="#" className="hover:text-blue-600"><Phone size={16} /></a>
              <a href="#" className="hover:text-blue-600"><MapPin size={16} /></a>
            </div>
          </div>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  );
}
