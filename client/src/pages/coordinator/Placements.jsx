import { useEffect, useState } from "react";
import { Briefcase, Plus, CheckCircle2, XCircle, Search } from "lucide-react";
import api from "../../api";
import { Badge, Modal, Spinner, EmptyState, PageHeader, Avatar } from "../../components/ui.jsx";

const blank = { student_id: "", company_id: "", supervisor_id: "", start_date: "", end_date: "" };

export default function CoordinatorPlacements() {
  const [placements, setPlacements] = useState(null);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = () => {
    api.get("/placements").then((res) => setPlacements(res.data));
    api.get("/students").then((res) => setStudents(res.data));
    api.get("/companies").then((res) => setCompanies(res.data));
    api.get("/auth/supervisors").then((res) => setSupervisors(res.data));
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    setSaving(true);
    try {
      await api.post("/placements", form);
      setOpen(false);
      setForm(blank);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Could not create placement");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/placements/${id}/status`, { status });
    load();
  };

  const filtered = (placements || []).filter((p) =>
    (p.student_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.company_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Internship Placements" subtitle="Assign students to companies and supervisors.">
        <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> Assign</button>
      </PageHeader>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9" placeholder="Search placements..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {placements === null ? <Spinner /> : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={Briefcase} title="No placements" hint="Create the first placement assignment." /></div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="card p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={p.student_name} size="sm" />
                  <div>
                    <h3 className="font-semibold text-slate-800">{p.student_name}</h3>
                    <p className="text-xs text-slate-400">{p.student_course}</p>
                  </div>
                </div>
                <Badge status={p.status} />
              </div>
              <div className="mb-3 grid gap-1 text-sm text-slate-600">
                <p><strong className="text-slate-800">Company:</strong> {p.company_name || "—"}</p>
                <p><strong className="text-slate-800">Supervisor:</strong> {p.supervisor_name || "—"}</p>
                <p><strong className="text-slate-800">Period:</strong> {p.start_date || "—"} to {p.end_date || "—"}</p>
              </div>
              {p.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(p.id, "approved")} className="btn-success"><CheckCircle2 size={16} /> Approve</button>
                  <button onClick={() => updateStatus(p.id, "rejected")} className="btn-danger"><XCircle size={16} /> Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Assign intern"
        footer={<>
          <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={saving || !form.student_id || !form.company_id}>
            {saving ? "Saving..." : "Assign"}
          </button>
        </>}
      >
        <div>
          <label className="label">Student</label>
          <select className="input" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
            <option value="">Select student</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.full_name} — {s.course}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Company / Office</label>
          <select className="input" value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })}>
            <option value="">Select company</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Supervisor</label>
          <select className="input" value={form.supervisor_id} onChange={(e) => setForm({ ...form, supervisor_id: e.target.value })}>
            <option value="">Select supervisor</option>
            {supervisors.map((s) => <option key={s.id} value={s.id}>{s.full_name} — {s.company_name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Start date</label><input className="input" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
          <div><label className="label">End date</label><input className="input" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
        </div>
      </Modal>
    </div>
  );
}
