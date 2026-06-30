import { useEffect, useState } from "react";
import { ClipboardList, Star, Send } from "lucide-react";
import api from "../../api";
import { Spinner, EmptyState, PageHeader, Modal, ProgressBar } from "../../components/ui.jsx";

const blank = {
  intern_id: "",
  attendance: 0,
  punctuality: 0,
  communication: 0,
  technical_skills: 0,
  professionalism: 0,
  initiative: 0,
  productivity: 0,
  adaptability: 0,
  teamwork: 0,
  leadership: 0,
  problem_solving: 0,
  comments: "",
};

const CRITERIA = [
  { key: "attendance", label: "Attendance" },
  { key: "punctuality", label: "Punctuality" },
  { key: "communication", label: "Communication" },
  { key: "technical_skills", label: "Technical Skills" },
  { key: "professionalism", label: "Professionalism" },
  { key: "initiative", label: "Initiative" },
  { key: "productivity", label: "Productivity" },
  { key: "adaptability", label: "Adaptability" },
  { key: "teamwork", label: "Teamwork" },
  { key: "leadership", label: "Leadership" },
  { key: "problem_solving", label: "Problem Solving" },
];

export default function SupervisorEvaluations() {
  const [evaluations, setEvaluations] = useState(null);
  const [interns, setInterns] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get("/evaluations").then((res) => setEvaluations(res.data));
    api.get("/students").then((res) => setInterns(res.data));
  };
  useEffect(() => { load(); }, []);

  const setScore = (k) => (e) => setForm({ ...form, [k]: Math.min(100, Math.max(0, Number(e.target.value))) });

  const submit = async () => {
    setSaving(true);
    try {
      await api.post("/evaluations", form);
      setOpen(false);
      setForm(blank);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Could not save evaluation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Performance Evaluation" subtitle="Evaluate your interns across key competencies.">
        <button className="btn-primary" onClick={() => setOpen(true)}><Star size={16} /> Evaluate</button>
      </PageHeader>

      {evaluations === null ? <Spinner /> : evaluations.length === 0 ? (
        <div className="card"><EmptyState icon={ClipboardList} title="No evaluations yet" hint="Create an evaluation for an intern." /></div>
      ) : (
        <div className="grid gap-4">
          {evaluations.map((e) => (
            <div key={e.id} className="card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">{e.intern_name}</h3>
                <div className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
                  <Star size={14} /> {e.overall_rating}%
                </div>
              </div>
              <div className="mb-3">
                <ProgressBar value={e.overall_rating} showLabel={false} />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {CRITERIA.map((c) => (
                  <div key={c.key} className="rounded-lg bg-slate-50 px-3 py-2 text-xs">
                    <span className="text-slate-500">{c.label}:</span>{" "}
                    <span className="font-semibold text-slate-800">{e[c.key]}%</span>
                  </div>
                ))}
              </div>
              {e.comments && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{e.comments}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New evaluation"
        footer={<>
          <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={saving || !form.intern_id}>
            <Send size={16} /> {saving ? "Saving..." : "Save"}
          </button>
        </>}
      >
        <div>
          <label className="label">Intern</label>
          <select className="input" value={form.intern_id} onChange={(e) => setForm({ ...form, intern_id: e.target.value })}>
            <option value="">Select intern</option>
            {interns.map((i) => <option key={i.id} value={i.id}>{i.full_name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {CRITERIA.map((c) => (
            <div key={c.key}>
              <label className="label">{c.label} (0-100)</label>
              <input className="input" type="number" min={0} max={100} value={form[c.key]} onChange={setScore(c.key)} />
            </div>
          ))}
        </div>
        <div>
          <label className="label">Overall comments</label>
          <textarea className="input min-h-[80px]" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
