import { useEffect, useState } from "react";
import { Briefcase, MapPin, Mail, Phone, Send, Building2, GraduationCap, Eye } from "lucide-react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext.jsx";
import { Badge, Modal, Spinner, EmptyState, PageHeader } from "../../components/ui.jsx";
import { DEPARTMENT_NAMES } from "../../constants.js";

const SAMPLE_OPENINGS = [
  {
    id: -1,
    title: "Software Development Intern",
    company_name: "Tech Solutions Inc.",
    supervisor_name: "Maria Santos",
    department: "College of Computer Studies",
    course: "BS Computer Science",
    slots: 5,
    location: "Quezon City",
    description: "Work with the engineering team on web applications using React and Node.js. Great for students interested in full-stack development.",
    contact_email: "careers@techsolutions.ph",
    contact_phone: "0917-123-4567",
    isSample: true,
  },
  {
    id: -2,
    title: "Marketing Assistant",
    company_name: "Brand Builders Co.",
    supervisor_name: "John Reyes",
    department: "College of Business",
    course: "BS Business Administration",
    slots: 3,
    location: "Makati City",
    description: "Assist in digital marketing campaigns, content creation, and social media management.",
    contact_email: "hr@brandbuilders.ph",
    contact_phone: "0918-234-5678",
    isSample: true,
  },
  {
    id: -3,
    title: "Accounting Intern",
    company_name: "Finance Partners",
    supervisor_name: "Anna Cruz",
    department: "College of Accountancy",
    course: "BS Accountancy",
    slots: 4,
    location: "Manila",
    description: "Support bookkeeping, financial reporting, and audit preparation under senior accountants.",
    contact_email: "interns@financepartners.ph",
    contact_phone: "0919-345-6789",
    isSample: true,
  },
  {
    id: -4,
    title: "IT Support Intern",
    company_name: "Digital Edge",
    supervisor_name: "Rodel Dizon",
    department: "College of Computer Studies",
    course: "BS Information Technology",
    slots: 2,
    location: "Pasig City",
    description: "Help maintain hardware and software systems, troubleshoot user issues, and document IT procedures.",
    contact_email: "support@digitaledge.ph",
    contact_phone: "0920-456-7890",
    isSample: true,
  },
  {
    id: -5,
    title: "HR Intern",
    company_name: "People First Corp",
    supervisor_name: "Liza Mendoza",
    department: "College of Business",
    course: "BS Psychology",
    slots: 3,
    location: "Taguig City",
    description: "Assist in recruitment, employee onboarding, and HR records management.",
    contact_email: "hr@peoplefirst.ph",
    contact_phone: "0921-567-8901",
    isSample: true,
  },
  {
    id: -6,
    title: "Graphic Design Intern",
    company_name: "Creative Studio",
    supervisor_name: "Paul Garcia",
    department: "College of Arts",
    course: "BS Multimedia Arts",
    slots: 2,
    location: "Quezon City",
    description: "Create visual content for social media, marketing materials, and brand assets.",
    contact_email: "hello@creativestudio.ph",
    contact_phone: "0922-678-9012",
    isSample: true,
  },
];

export default function InternOpenings() {
  const { user } = useAuth();
  const [tab, setTab] = useState("browse");
  const [openings, setOpenings] = useState(null);
  const [applications, setApplications] = useState(null);
  const [dept, setDept] = useState("");
  const [active, setActive] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const loadOpenings = () => api.get("/openings").then((res) => setOpenings([...SAMPLE_OPENINGS, ...(res.data || [])]));
  const loadApps = () => api.get("/openings/my/applications").then((res) => setApplications(res.data));

  useEffect(() => {
    loadOpenings();
    loadApps();
  }, []);

  const openApply = (o) => {
    setActive(o);
    setMessage("");
  };

  const apply = async () => {
    if (active?.isSample) {
      alert("This is a sample opening for presentation purposes. Applying is disabled in demo mode.");
      setActive(null);
      return;
    }
    setSaving(true);
    try {
      await api.post(`/openings/${active.id}/apply`, { message });
      setActive(null);
      loadOpenings();
      loadApps();
    } catch (err) {
      alert(err.response?.data?.error || "Could not apply");
    } finally {
      setSaving(false);
    }
  };

  const withdraw = async (id) => {
    if (!confirm("Withdraw your application?")) return;
    await api.delete(`/openings/${id}/apply`);
    loadOpenings();
    loadApps();
  };

  const filtered = (openings || []).filter((o) => !dept || o.department === dept);

  return (
    <div className="space-y-6">
      <PageHeader title="Find OJT" subtitle="Browse company openings and contact employers directly.">
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setTab("browse")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${tab === "browse" ? "bg-white text-brand-700 shadow-soft" : "text-slate-500"}`}
          >
            Browse
          </button>
          <button
            onClick={() => setTab("applications")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${tab === "applications" ? "bg-white text-brand-700 shadow-soft" : "text-slate-500"}`}
          >
            My applications
          </button>
        </div>
      </PageHeader>

      {tab === "browse" ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <select className="input w-72 max-w-full" value={dept} onChange={(e) => setDept(e.target.value)}>
              <option value="">All departments</option>
              {DEPARTMENT_NAMES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {user?.department && (
              <button className="btn-ghost" onClick={() => setDept(user.department)}>
                <GraduationCap size={16} /> My department
              </button>
            )}
          </div>

          {openings === null ? (
            <Spinner />
          ) : filtered.length === 0 ? (
            <div className="card"><EmptyState icon={Briefcase} title="No openings yet" hint="Check back soon — companies post OJT openings here." /></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((o) => (
                <div key={o.id} className="card flex flex-col p-5">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-800">{o.title}</h3>
                      <p className="flex items-center gap-1 text-xs text-slate-400">
                        <Building2 size={13} /> {o.company_name || o.supervisor_name}
                      </p>
                    </div>
                    {o.my_application && <Badge status={o.my_application} />}
                    {o.isSample && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Demo</span>}
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1.5 text-xs">
                    {o.department && <span className="rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-600">{o.department}</span>}
                    {o.course && <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">{o.course}</span>}
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">{o.slots} slot{o.slots === 1 ? "" : "s"}</span>
                  </div>
                  {o.location && (
                    <p className="mb-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={14} /> {o.location}</p>
                  )}
                  {o.description && <p className="mb-3 flex-1 whitespace-pre-wrap text-sm text-slate-600 line-clamp-4">{o.description}</p>}

                  <div className="mt-auto space-y-1 border-t border-slate-100 pt-3 text-sm text-slate-500">
                    {o.contact_email && (
                      <a href={`mailto:${o.contact_email}`} className="flex items-center gap-1.5 hover:text-brand-600">
                        <Mail size={14} /> {o.contact_email}
                      </a>
                    )}
                    {o.contact_phone && (
                      <p className="flex items-center gap-1.5"><Phone size={14} /> {o.contact_phone}</p>
                    )}
                  </div>

                  <div className="mt-3">
                    {o.my_application ? (
                      <button className="btn-ghost w-full text-rose-600" onClick={() => withdraw(o.id)}>
                        Withdraw application
                      </button>
                    ) : o.isSample ? (
                      <button className="btn-ghost w-full" onClick={() => openApply(o)}>
                        <Eye size={16} /> View demo
                      </button>
                    ) : (
                      <button className="btn-primary w-full" onClick={() => openApply(o)}>
                        <Send size={16} /> Apply / Contact
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : applications === null ? (
        <Spinner />
      ) : applications.length === 0 ? (
        <div className="card"><EmptyState icon={Send} title="No applications yet" hint="Apply to an opening from the Browse tab." /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Opening</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Applied</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((a) => (
                <tr key={a.id} className="transition hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium text-slate-700">{a.title}</td>
                  <td className="px-4 py-3 text-slate-500">{a.company_name || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{a.created_at?.slice(0, 10)}</td>
                  <td className="px-4 py-3"><Badge status={a.status} /></td>
                  <td className="px-4 py-3">
                    {a.contact_email ? (
                      <a href={`mailto:${a.contact_email}`} className="text-brand-600 hover:underline">{a.contact_email}</a>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active ? `${active.isSample ? "Demo" : "Apply"}: ${active.title}` : ""}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setActive(null)}>{active?.isSample ? "Close" : "Cancel"}</button>
            {!active?.isSample && (
              <button className="btn-primary" onClick={apply} disabled={saving}>{saving ? "Sending..." : "Send application"}</button>
            )}
          </>
        }
      >
        {active && (
          <>
            {active.isSample ? (
              <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                This is a demo opening for presentation purposes. Applying is disabled.
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Sending your interest to <span className="font-semibold text-slate-700">{active.company_name || active.supervisor_name}</span>.
                They can review your profile and accept you as an OJT intern.
              </p>
            )}
            <div>
              <label className="label">Message (optional)</label>
              <textarea
                className="input min-h-[120px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself, your course, and why you're interested..."
                disabled={active.isSample}
              />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
