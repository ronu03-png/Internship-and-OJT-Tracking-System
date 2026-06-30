import { useEffect, useState } from "react";
import { BookOpen, Plus, Send, Trash2 } from "lucide-react";
import api from "../../api";
import { Badge, Spinner, EmptyState, PageHeader, Modal } from "../../components/ui.jsx";

const blank = { date: new Date().toISOString().split("T")[0], accomplishments: "", photo_urls: "", file_urls: "" };

export default function InternJournals() {
  const [journals, setJournals] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/journals").then((res) => setJournals(res.data));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setSaving(true);
    try {
      await api.post("/journals", {
        ...form,
        photo_urls: form.photo_urls.split(",").map((s) => s.trim()).filter(Boolean),
        file_urls: form.file_urls.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setOpen(false);
      setForm(blank);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Could not submit journal");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this journal entry?")) return;
    await api.delete(`/journals/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Daily Journal" subtitle="Log your daily accomplishments and experiences.">
        <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> New entry</button>
      </PageHeader>

      {journals === null ? <Spinner /> : journals.length === 0 ? (
        <div className="card"><EmptyState icon={BookOpen} title="No journal entries" hint="Write your first daily journal entry." /></div>
      ) : (
        <div className="grid gap-4">
          {journals.map((j) => (
            <div key={j.id} className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen size={18} className="text-brand-600" />
                  <h3 className="font-semibold text-slate-800">{j.date}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={j.status} />
                  <button onClick={() => remove(j.id)} className="text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-slate-700">{j.accomplishments}</p>
              {j.supervisor_feedback && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Feedback: {j.supervisor_feedback}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New daily journal"
        footer={<>
          <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={saving || !form.accomplishments || !form.date}>
            <Send size={16} /> {saving ? "Submitting..." : "Submit"}
          </button>
        </>}
      >
        <div>
          <label className="label">Date</label>
          <input className="input" type="date" value={form.date} onChange={set("date")} />
        </div>
        <div>
          <label className="label">Accomplishments</label>
          <textarea className="input min-h-[120px]" value={form.accomplishments} onChange={set("accomplishments")} placeholder="What did you accomplish today?" />
        </div>
        <div>
          <label className="label">Photo URLs (comma separated)</label>
          <input className="input" value={form.photo_urls} onChange={set("photo_urls")} />
        </div>
        <div>
          <label className="label">File URLs (comma separated)</label>
          <input className="input" value={form.file_urls} onChange={set("file_urls")} />
        </div>
      </Modal>
    </div>
  );
}
