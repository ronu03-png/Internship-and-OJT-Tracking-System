import { useEffect, useState } from "react";
import { Calendar, Plus, Send, Trash2 } from "lucide-react";
import api from "../../api";
import { Badge, Spinner, EmptyState, PageHeader, Modal } from "../../components/ui.jsx";

const blank = { month: "", summary: "", hours_rendered: "", performance: "", learning_outcomes: "" };

export default function InternMonthlyReports() {
  const [reports, setReports] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/monthly-reports").then((res) => setReports(res.data));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setSaving(true);
    try {
      await api.post("/monthly-reports", { ...form, hours_rendered: Number(form.hours_rendered) || 0 });
      setOpen(false);
      setForm(blank);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Could not submit report");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this monthly report?")) return;
    await api.delete(`/monthly-reports/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Monthly Report" subtitle="Submit monthly summaries and learning outcomes.">
        <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> New report</button>
      </PageHeader>

      {reports === null ? <Spinner /> : reports.length === 0 ? (
        <div className="card"><EmptyState icon={Calendar} title="No monthly reports" hint="Submit your first monthly report." /></div>
      ) : (
        <div className="grid gap-4">
          {reports.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-brand-600" />
                  <h3 className="font-semibold text-slate-800">{r.month}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={r.status} />
                  <button onClick={() => remove(r.id)} className="text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-700">
                <p className="whitespace-pre-wrap"><strong className="text-slate-900">Summary:</strong><br/>{r.summary}</p>
                <p><strong className="text-slate-900">Hours rendered:</strong> {r.hours_rendered}</p>
                {r.performance && <p className="whitespace-pre-wrap"><strong className="text-slate-900">Performance:</strong><br/>{r.performance}</p>}
                {r.learning_outcomes && <p className="whitespace-pre-wrap"><strong className="text-slate-900">Learning outcomes:</strong><br/>{r.learning_outcomes}</p>}
              </div>
              {r.supervisor_remarks && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Remarks: {r.supervisor_remarks}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New monthly report"
        footer={<>
          <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={saving || !form.month || !form.summary}>
            <Send size={16} /> {saving ? "Submitting..." : "Submit"}
          </button>
        </>}
      >
        <div><label className="label">Month</label><input className="input" value={form.month} onChange={set("month")} placeholder="June 2026" /></div>
        <div><label className="label">Hours rendered</label><input className="input" type="number" value={form.hours_rendered} onChange={set("hours_rendered")} /></div>
        <div><label className="label">Summary</label><textarea className="input min-h-[100px]" value={form.summary} onChange={set("summary")} /></div>
        <div><label className="label">Performance</label><textarea className="input min-h-[80px]" value={form.performance} onChange={set("performance")} /></div>
        <div><label className="label">Learning outcomes</label><textarea className="input min-h-[80px]" value={form.learning_outcomes} onChange={set("learning_outcomes")} /></div>
      </Modal>
    </div>
  );
}
