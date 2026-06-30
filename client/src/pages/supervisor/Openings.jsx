import { useEffect, useState } from "react";
import { Plus, Briefcase, Users, Pencil, Trash2, Check, X, Power } from "lucide-react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext.jsx";
import { Badge, Modal, Spinner, EmptyState, PageHeader, Avatar } from "../../components/ui.jsx";
import { DEPARTMENTS, coursesForDepartment } from "../../constants.js";

const blank = {
  title: "",
  department: "",
  course: "",
  location: "",
  slots: 1,
  description: "",
  contact_email: "",
  contact_phone: "",
};

export default function SupervisorOpenings() {
  const { user } = useAuth();
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [applicantsFor, setApplicantsFor] = useState(null);
  const [applicants, setApplicants] = useState(null);

  const load = () => api.get("/openings").then((res) => setRows(res.data));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setDepartment = (e) => setForm({ ...form, department: e.target.value, course: "" });

  const openNew = () => {
    setForm({ ...blank, contact_email: user?.email || "" });
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (o) => {
    setForm({
      title: o.title,
      department: o.department || "",
      course: o.course || "",
      location: o.location || "",
      slots: o.slots || 1,
      description: o.description || "",
      contact_email: o.contact_email || "",
      contact_phone: o.contact_phone || "",
    });
    setEditing(o.id);
    setOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    try {
      if (editing) await api.put(`/openings/${editing}`, form);
      else await api.post("/openings", form);
      setOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (o) => {
    await api.patch(`/openings/${o.id}/status`, { status: o.status === "open" ? "closed" : "open" });
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this opening and its applications?")) return;
    await api.delete(`/openings/${id}`);
    load();
  };

  const viewApplicants = async (o) => {
    setApplicantsFor(o);
    setApplicants(null);
    const res = await api.get(`/openings/${o.id}/applications`);
    setApplicants(res.data);
  };

  const decide = async (appId, status) => {
    await api.patch(`/openings/applications/${appId}`, { status });
    const res = await api.get(`/openings/${applicantsFor.id}/applications`);
    setApplicants(res.data);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="OJT Openings" subtitle="Post openings so students can find and apply to your company.">
        <button className="btn-primary" onClick={openNew}>
          <Plus size={16} /> New opening
        </button>
      </PageHeader>

      {rows === null ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <div className="card"><EmptyState icon={Briefcase} title="No openings yet" hint="Post your first OJT opening using the button above." /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((o) => (
            <div key={o.id} className="card flex flex-col p-5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-800">{o.title}</h3>
                  <p className="text-xs text-slate-400">{o.location || "No location"} · {o.slots} slot{o.slots === 1 ? "" : "s"}</p>
                </div>
                <Badge status={o.status} />
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5 text-xs">
                {o.department && <span className="rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-600">{o.department}</span>}
                {o.course && <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">{o.course}</span>}
              </div>
              {o.description && <p className="mb-3 flex-1 whitespace-pre-wrap text-sm text-slate-600 line-clamp-3">{o.description}</p>}

              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                <button className="btn-ghost flex-1" onClick={() => viewApplicants(o)}>
                  <Users size={16} /> Applicants ({o.applicant_count})
                </button>
                <button className="btn-ghost" onClick={() => toggleStatus(o)} title={o.status === "open" ? "Close" : "Reopen"}>
                  <Power size={16} />
                </button>
                <button className="btn-ghost" onClick={() => openEdit(o)} title="Edit">
                  <Pencil size={16} />
                </button>
                <button className="btn-ghost text-rose-600" onClick={() => remove(o.id)} title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / edit opening */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit opening" : "New OJT opening"}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={submit} disabled={saving || !form.title}>
              {saving ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        <div>
          <label className="label">Title</label>
          <input className="input" value={form.title} onChange={set("title")} placeholder="e.g. Web Developer Intern" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Department</label>
            <select className="input" value={form.department} onChange={setDepartment}>
              <option value="">Any department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Course / Program</label>
            <select className="input" value={form.course} onChange={set("course")} disabled={!form.department}>
              <option value="">Any course</option>
              {coursesForDepartment(form.department).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={set("location")} placeholder="e.g. Cebu City (On-site)" />
          </div>
          <div>
            <label className="label">Slots</label>
            <input className="input" type="number" min={1} value={form.slots} onChange={set("slots")} />
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[100px]" value={form.description} onChange={set("description")} placeholder="Responsibilities, requirements, schedule..." />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Contact email</label>
            <input className="input" type="email" value={form.contact_email} onChange={set("contact_email")} />
          </div>
          <div>
            <label className="label">Contact phone</label>
            <input className="input" value={form.contact_phone} onChange={set("contact_phone")} placeholder="Optional" />
          </div>
        </div>
      </Modal>

      {/* Applicants */}
      <Modal
        open={!!applicantsFor}
        onClose={() => setApplicantsFor(null)}
        title={applicantsFor ? `Applicants — ${applicantsFor.title}` : ""}
      >
        {applicants === null ? (
          <Spinner />
        ) : applicants.length === 0 ? (
          <EmptyState icon={Users} title="No applicants yet" hint="Students who apply will appear here." />
        ) : (
          <div className="space-y-3">
            {applicants.map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center gap-3">
                  <Avatar name={a.student_name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800">{a.student_name}</p>
                    <p className="truncate text-xs text-slate-400">{a.student_course || "—"}</p>
                  </div>
                  <Badge status={a.status} />
                </div>
                {a.message && <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-2.5 text-sm text-slate-600">{a.message}</p>}
                <div className="mt-2 flex items-center justify-between">
                  <a href={`mailto:${a.student_email}`} className="text-xs font-medium text-brand-600 hover:underline">{a.student_email}</a>
                  {a.status === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => decide(a.id, "accepted")} className="rounded-lg bg-emerald-100 p-1.5 text-emerald-700 hover:bg-emerald-200" title="Accept">
                        <Check size={16} />
                      </button>
                      <button onClick={() => decide(a.id, "declined")} className="rounded-lg bg-rose-100 p-1.5 text-rose-700 hover:bg-rose-200" title="Decline">
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
