import { useEffect, useState } from "react";
import { Plus, FileText, Trash2, MessageSquareQuote } from "lucide-react";
import api from "../../api";
import { Badge, Modal, Spinner, EmptyState, PageHeader } from "../../components/ui.jsx";

const blank = { title: "", week_number: "", content: "" };

export default function InternReports() {
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/reports").then((res) => setRows(res.data));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const openNew = () => { setForm(blank); setEditing(null); setOpen(true); };
  const openEdit = (r) => {
    setForm({ title: r.title, week_number: r.week_number || "", content: r.content });
    setEditing(r.id);
    setOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    try {
      if (editing) await api.put(`/reports/${editing}`, form);
      else await api.post("/reports", form);
      setOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this report?")) return;
    await api.delete(`/reports/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Narrative Reports" subtitle="Submit weekly narrative reports for your supervisor to review.">
        <button className="btn-primary" onClick={openNew}>
          <Plus size={16} /> New report
        </button>
      </PageHeader>

      {rows === null ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <div className="card"><EmptyState icon={FileText} title="No reports yet" hint="Write your first narrative report." /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((r) => (
            <div key={r.id} className="card flex flex-col p-5 transition hover:shadow-glow">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-800">{r.title}</h3>
                  <p className="text-xs text-slate-400">
                    {r.week_number ? `Week ${r.week_number} · ` : ""}{r.created_at?.slice(0, 10)}
                  </p>
                </div>
                <Badge status={r.status} />
              </div>
              <p className="mb-3 flex-1 whitespace-pre-wrap text-sm text-slate-600 line-clamp-5">{r.content}</p>
              {r.feedback && (
                <div className="mb-3 rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
                  <p className="mb-1 flex items-center gap-1 font-medium"><MessageSquareQuote size={14} /> Supervisor feedback</p>
                  {r.feedback}
                </div>
              )}
              <div className="flex gap-2">
                {r.status !== "approved" && (
                  <button className="btn-ghost flex-1" onClick={() => openEdit(r)}>Edit & resubmit</button>
                )}
                <button onClick={() => remove(r.id)} className="btn-ghost text-rose-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit report" : "New narrative report"}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={submit} disabled={saving || !form.title || !form.content}>
              {saving ? "Saving..." : "Submit"}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={set("title")} placeholder="e.g. Weekly accomplishments" />
          </div>
          <div>
            <label className="label">Week #</label>
            <input className="input" type="number" value={form.week_number} onChange={set("week_number")} min={1} />
          </div>
        </div>
        <div>
          <label className="label">Narrative</label>
          <textarea className="input min-h-[160px]" value={form.content} onChange={set("content")} placeholder="Describe what you did, learned, and accomplished..." />
        </div>
      </Modal>
    </div>
  );
}
