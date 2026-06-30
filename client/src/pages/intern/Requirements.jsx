import { useEffect, useState } from "react";
import { Plus, FileCheck2, Trash2, ExternalLink, MessageSquareQuote } from "lucide-react";
import api from "../../api";
import { Badge, Modal, Spinner, EmptyState, PageHeader } from "../../components/ui.jsx";
import { REQUIREMENT_PRESETS } from "../../constants.js";

const blank = { name: "", link: "", note: "" };

export default function InternRequirements() {
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/requirements").then((res) => setRows(res.data));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const openNew = () => { setForm(blank); setEditing(null); setOpen(true); };
  const openEdit = (r) => {
    setForm({ name: r.name, link: r.link || "", note: r.note || "" });
    setEditing(r.id);
    setOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    try {
      if (editing) await api.put(`/requirements/${editing}`, form);
      else await api.post("/requirements", form);
      setOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this requirement?")) return;
    await api.delete(`/requirements/${id}`);
    load();
  };

  const submittedNames = new Set((rows || []).map((r) => r.name));
  const approvedCount = (rows || []).filter((r) => r.status === "approved").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="OJT Requirements"
        subtitle={rows ? `${approvedCount} of ${rows.length} approved` : "Submit and track your OJT documents."}
      >
        <button className="btn-primary" onClick={openNew}>
          <Plus size={16} /> Add requirement
        </button>
      </PageHeader>

      {rows === null ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <div className="card"><EmptyState icon={FileCheck2} title="No requirements yet" hint="Add the documents your school requires for OJT." /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((r) => (
            <div key={r.id} className="card flex flex-col p-5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-800">{r.name}</h3>
                  <p className="text-xs text-slate-400">Submitted {r.created_at?.slice(0, 10)}</p>
                </div>
                <Badge status={r.status} />
              </div>
              {r.note && <p className="mb-2 whitespace-pre-wrap text-sm text-slate-600">{r.note}</p>}
              {r.link && (
                <a href={r.link} target="_blank" rel="noreferrer" className="mb-2 flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline">
                  <ExternalLink size={14} /> View document
                </a>
              )}
              {r.feedback && (
                <div className="mb-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                  <p className="mb-1 flex items-center gap-1 font-medium"><MessageSquareQuote size={14} /> Supervisor feedback</p>
                  {r.feedback}
                </div>
              )}
              <div className="mt-auto flex gap-2 pt-2">
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
        title={editing ? "Edit requirement" : "Add requirement"}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={submit} disabled={saving || !form.name}>
              {saving ? "Saving..." : "Submit"}
            </button>
          </>
        }
      >
        <div>
          <label className="label">Requirement</label>
          <input
            className="input"
            list="requirement-presets"
            value={form.name}
            onChange={set("name")}
            placeholder="e.g. Medical Certificate"
          />
          <datalist id="requirement-presets">
            {REQUIREMENT_PRESETS.filter((p) => editing || !submittedNames.has(p)).map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="label">Document link (optional)</label>
          <input className="input" value={form.link} onChange={set("link")} placeholder="Google Drive / file URL" />
        </div>
        <div>
          <label className="label">Note (optional)</label>
          <textarea className="input min-h-[90px]" value={form.note} onChange={set("note")} placeholder="Any details for your supervisor..." />
        </div>
      </Modal>
    </div>
  );
}
