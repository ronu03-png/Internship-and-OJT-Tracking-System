import { useEffect, useState } from "react";
import { Megaphone, Pin, Plus, Trash2, Send } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { Badge, Spinner, EmptyState, PageHeader, Modal } from "../components/ui.jsx";

const blank = { title: "", content: "", pinned: false, attachment_url: "" };

export default function Announcements() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const canManage = ["admin", "coordinator"].includes(user?.role);

  const load = () => api.get("/announcements").then((res) => setItems(res.data));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    setSaving(true);
    try {
      await api.post("/announcements", form);
      setOpen(false);
      setForm(blank);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Could not post announcement");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this announcement?")) return;
    await api.delete(`/announcements/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Announcements" subtitle="Important updates and notices from coordinators and administrators.">
        {canManage && (
          <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> Post</button>
        )}
      </PageHeader>

      {items === null ? <Spinner /> : items.length === 0 ? (
        <div className="card"><EmptyState icon={Megaphone} title="No announcements" hint="Check back later for updates." /></div>
      ) : (
        <div className="grid gap-4">
          {items.map((a) => (
            <div key={a.id} className={`card p-5 ${a.pinned ? "border-l-4 border-l-brand-500" : ""}`}>
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-600">
                    <Megaphone size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{a.title}</h3>
                    <p className="text-xs text-slate-400">{a.author_name} · {new Date(a.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {a.pinned && <Badge status="approved" />}
                  {canManage && (
                    <button onClick={() => remove(a.id)} className="text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
                  )}
                </div>
              </div>
              <p className="whitespace-pre-wrap text-slate-700">{a.content}</p>
              {a.attachment_url && <a href={a.attachment_url} className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline" target="_blank" rel="noreferrer">View attachment</a>}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Post announcement"
        footer={<>
          <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={saving || !form.title || !form.content}>
            <Send size={16} /> {saving ? "Posting..." : "Post"}
          </button>
        </>}
      >
        <div><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div><label className="label">Content</label><textarea className="input min-h-[120px]" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Attachment URL</label><input className="input" value={form.attachment_url} onChange={(e) => setForm({ ...form, attachment_url: e.target.value })} /></div>
          <div className="flex items-center gap-2 pt-6">
            <input id="pin" type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />
            <label htmlFor="pin" className="text-sm font-medium text-slate-600">Pin announcement</label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
