import { useEffect, useState } from "react";
import { CalendarDays, Plus, Trash2, Send, Calendar as CalendarIcon, Clock, Users, Sun, GraduationCap, Briefcase, PartyPopper } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { Badge, Spinner, EmptyState, PageHeader, Modal } from "../components/ui.jsx";

const blank = { title: "", type: "", start_date: "", end_date: "", description: "" };

const TYPE_META = {
  event: { icon: PartyPopper, label: "Event", color: "bg-purple-100 text-purple-700 ring-purple-200" },
  deadline: { icon: Clock, label: "Deadline", color: "bg-rose-100 text-rose-700 ring-rose-200" },
  meeting: { icon: Users, label: "Meeting", color: "bg-sky-100 text-sky-700 ring-sky-200" },
  holiday: { icon: Sun, label: "Holiday", color: "bg-amber-100 text-amber-700 ring-amber-200" },
  defense: { icon: GraduationCap, label: "Defense", color: "bg-emerald-100 text-emerald-700 ring-emerald-200" },
  ceremony: { icon: CalendarIcon, label: "Ceremony", color: "bg-indigo-100 text-indigo-700 ring-indigo-200" },
  default: { icon: Briefcase, label: "Event", color: "bg-slate-100 text-slate-700 ring-slate-200" },
};

function EventTypeBadge({ type }) {
  const key = (type || "").toLowerCase();
  const meta = TYPE_META[key] || TYPE_META.default;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.color}`}>
      <Icon size={14} />
      {meta.label}
    </span>
  );
}

export default function Calendar() {
  const { user } = useAuth();
  const [events, setEvents] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const canManage = ["admin", "supervisor"].includes(user?.role);

  const load = () => api.get("/calendar").then((res) => setEvents(res.data));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    setSaving(true);
    try {
      await api.post("/calendar", form);
      setOpen(false);
      setForm(blank);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Could not save event");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this event?")) return;
    await api.delete(`/calendar/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Calendar" subtitle="Important dates, deadlines, and events.">
        {canManage && <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> Add event</button>}
      </PageHeader>

      {events === null ? <Spinner /> : events.length === 0 ? (
        <div className="card"><EmptyState icon={CalendarDays} title="No events" hint="Add internship dates, deadlines, and meetings." /></div>
      ) : (
        <div className="grid gap-4">
          {events.map((e) => (
            <div key={e.id} className="card p-5">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-800">{e.title}</h3>
                  <p className="text-xs text-slate-400">{e.start_date}{e.end_date ? ` to ${e.end_date}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  {e.type && <EventTypeBadge type={e.type} />}
                  {canManage && <button onClick={() => remove(e.id)} className="text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>}
                </div>
              </div>
              {e.description && <p className="text-sm text-slate-600">{e.description}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add event"
        footer={<>
          <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={saving || !form.title || !form.start_date}>
            <Send size={16} /> {saving ? "Saving..." : "Save"}
          </button>
        </>}
      >
        <div><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div><label className="label">Type</label><input className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="deadline, meeting, holiday..." /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Start date</label><input className="input" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
          <div><label className="label">End date</label><input className="input" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
        </div>
        <div><label className="label">Description</label><textarea className="input min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      </Modal>
    </div>
  );
}
