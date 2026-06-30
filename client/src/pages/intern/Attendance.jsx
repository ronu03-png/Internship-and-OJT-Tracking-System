import { useEffect, useState } from "react";
import { Plus, Trash2, CalendarClock } from "lucide-react";
import api from "../../api";
import { Badge, Modal, Spinner, EmptyState, PageHeader } from "../../components/ui.jsx";

const today = () => new Date().toISOString().slice(0, 10);

export default function InternAttendance() {
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: today(), time_in: "08:00", time_out: "17:00", remarks: "" });
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/attendance").then((res) => setRows(res.data));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setSaving(true);
    try {
      await api.post("/attendance", form);
      setOpen(false);
      setForm({ date: today(), time_in: "08:00", time_out: "17:00", remarks: "" });
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this attendance record?")) return;
    await api.delete(`/attendance/${id}`);
    load();
  };

  const totalApproved = (rows || []).filter((r) => r.status === "approved").reduce((s, r) => s + r.hours, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" subtitle={`Log your daily time in and out. Approved hours: ${totalApproved}`}>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={16} /> Log day
        </button>
      </PageHeader>

      <div className="card overflow-hidden">
        {rows === null ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <EmptyState icon={CalendarClock} title="No attendance yet" hint="Log your first day using the button above." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time in</th>
                <th className="px-4 py-3">Time out</th>
                <th className="px-4 py-3">Hours</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Remarks</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id} className="transition hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium text-slate-700">{r.date}</td>
                  <td className="px-4 py-3">{r.time_in || "—"}</td>
                  <td className="px-4 py-3">{r.time_out || "—"}</td>
                  <td className="px-4 py-3 font-semibold">{r.hours}</td>
                  <td className="px-4 py-3"><Badge status={r.status} /></td>
                  <td className="px-4 py-3 text-slate-500">{r.remarks || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(r.id)} className="text-slate-400 hover:text-rose-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Log attendance"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={submit} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </>
        }
      >
        <div>
          <label className="label">Date</label>
          <input className="input" type="date" value={form.date} onChange={set("date")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Time in</label>
            <input className="input" type="time" value={form.time_in} onChange={set("time_in")} />
          </div>
          <div>
            <label className="label">Time out</label>
            <input className="input" type="time" value={form.time_out} onChange={set("time_out")} />
          </div>
        </div>
        <div>
          <label className="label">Remarks (optional)</label>
          <input className="input" value={form.remarks} onChange={set("remarks")} placeholder="Tasks done, notes..." />
        </div>
        <p className="text-xs text-slate-400">A 1-hour lunch break is deducted automatically for shifts longer than 5 hours.</p>
      </Modal>
    </div>
  );
}
