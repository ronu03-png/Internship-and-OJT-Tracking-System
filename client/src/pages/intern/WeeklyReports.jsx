import { useEffect, useState } from "react";
import { FileText, Plus, Send, Trash2 } from "lucide-react";
import api from "../../api";
import { Badge, Spinner, EmptyState, PageHeader, Modal } from "../../components/ui.jsx";

const blank = { week_number: 1, title: "", accomplishments: "", reflection: "", problems: "", solutions: "", file_urls: "" };

export default function InternWeeklyReports() {
  const [reports, setReports] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/weekly-reports").then((res) => setReports(res.data));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setSaving(true);
    try {
      await api.post("/weekly-reports", {
        ...form,
        week_number: Number(form.week_number),
        file_urls: form.file_urls.split(",").map((s) => s.trim()).filter(Boolean),
      });
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
    if (!confirm("Delete this weekly report?")) return;
    await api.delete(`/weekly-reports/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Weekly Report" subtitle="Submit your weekly accomplishment, reflection, and challenges.">
        <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> New report</button>
      </PageHeader>

      {reports === null ? <Spinner /> : reports.length === 0 ? (
        <div className="card"><EmptyState icon={FileText} title="No weekly reports" hint="Submit your first weekly report." /></div>
      ) : (
        <div className="grid gap-4">
          {reports.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-brand-600" />
                  <h3 className="font-semibold text-slate-800">Week {r.week_number}{r.title ? ` · ${r.title}` : ""}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={r.status} />
                  <button onClick={() => remove(r.id)} className="text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="space-y-3 text-slate-700">
                <p className="whitespace-pre-wrap"><strong className="text-slate-900">Accomplishments:</strong><br/>{r.accomplishments}</p>
                {r.reflection && <p className="whitespace-pre-wrap"><strong className="text-slate-900">Reflection:</strong><br/>{r.reflection}</p>}
                {r.problems && <p className="whitespace-pre-wrap"><strong className="text-slate-900">Problems:</strong><br/>{r.problems}</p>}
                {r.solutions && <p className="whitespace-pre-wrap"><strong className="text-slate-900">Solutions:</strong><br/>{r.solutions}</p>}
              </div>
              {r.supervisor_comments && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Comments: {r.supervisor_comments}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New weekly report"
        footer={<>
          <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={saving || !form.week_number || !form.accomplishments}>
            <Send size={16} /> {saving ? "Submitting..." : "Submit"}
          </button>
        </>}
      >
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Week number</label><input className="input" type="number" min={1} value={form.week_number} onChange={set("week_number")} /></div>
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={set("title")} /></div>
        </div>
        <div><label className="label">Accomplishments</label><textarea className="input min-h-[100px]" value={form.accomplishments} onChange={set("accomplishments")} /></div>
        <div><label className="label">Reflection</label><textarea className="input min-h-[80px]" value={form.reflection} onChange={set("reflection")} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Problems</label><textarea className="input min-h-[80px]" value={form.problems} onChange={set("problems")} /></div>
          <div><label className="label">Solutions</label><textarea className="input min-h-[80px]" value={form.solutions} onChange={set("solutions")} /></div>
        </div>
        <div><label className="label">File URLs (comma separated)</label><input className="input" value={form.file_urls} onChange={set("file_urls")} /></div>
      </Modal>
    </div>
  );
}
