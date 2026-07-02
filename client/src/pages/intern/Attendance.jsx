import { useEffect, useState } from "react";
import { Plus, Trash2, CalendarClock, LogIn, LogOut, Lock, MapPin, AlertCircle } from "lucide-react";
import api from "../../api";
import { Badge, Modal, Spinner, EmptyState, PageHeader } from "../../components/ui.jsx";

const today = () => new Date().toISOString().slice(0, 10);

// Ask the browser for the current GPS position (used for geofence verification).
function getPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({ lat: null, lng: null });
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({ lat: null, lng: null }),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

export default function InternAttendance() {
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: today(), time_in: "08:00", time_out: "17:00", remarks: "" });
  const [saving, setSaving] = useState(false);
  const [dtr, setDtr] = useState(null);      // eligibility + today's session
  const [punching, setPunching] = useState(false);
  const [error, setError] = useState("");

  const load = () => api.get("/attendance").then((res) => setRows(res.data));
  const loadDtr = () => api.get("/attendance/eligibility").then((res) => setDtr(res.data)).catch(() => {});
  useEffect(() => { load(); loadDtr(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const punch = async (action) => {
    setError("");
    setPunching(true);
    try {
      const { lat, lng } = await getPosition();
      await api.post(`/attendance/${action}`, { lat, lng });
      await Promise.all([load(), loadDtr()]);
    } catch (err) {
      setError(err.response?.data?.error || "Could not record your time. Please try again.");
    } finally {
      setPunching(false);
    }
  };

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
    await Promise.all([load(), loadDtr()]);
  };

  const totalApproved = (rows || []).filter((r) => r.status === "approved").reduce((s, r) => s + r.hours, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" subtitle={`Log your daily time in and out. Approved hours: ${totalApproved}`}>
        <button className="btn-ghost" onClick={() => setOpen(true)}>
          <Plus size={16} /> Manual log
        </button>
      </PageHeader>

      {/* DTR clock in/out panel (server-timestamped, GPS-verified) */}
      {dtr && (
        dtr.locked ? (
          <div className="card flex items-start gap-3 border-amber-200 bg-amber-50 p-4">
            <Lock size={20} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-800">Attendance locked</p>
              <p className="text-sm text-amber-700">{dtr.reason}</p>
            </div>
          </div>
        ) : (
          <div className="card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">Server time (Asia/Manila)</p>
                <p className="text-2xl font-bold text-slate-800">{dtr.server_time}</p>
                <p className="text-xs text-slate-400">{dtr.server_date}</p>
                {dtr.open_session && (
                  <p className="mt-1 text-sm font-medium text-emerald-600">Clocked in at {dtr.open_session.time_in}</p>
                )}
                {dtr.today?.time_out && (
                  <p className="mt-1 text-sm text-slate-500">Today: {dtr.today.time_in} - {dtr.today.time_out} ({dtr.today.hours}h)</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {dtr.can_clock_in && (
                  <button className="btn-primary" onClick={() => punch("clock-in")} disabled={punching}>
                    <LogIn size={16} /> {punching ? "Recording..." : "Clock In"}
                  </button>
                )}
                {dtr.can_clock_out && (
                  <button className="btn-danger" onClick={() => punch("clock-out")} disabled={punching}>
                    <LogOut size={16} /> {punching ? "Recording..." : "Clock Out"}
                  </button>
                )}
                {!dtr.can_clock_in && !dtr.can_clock_out && (
                  <span className="text-sm font-medium text-slate-400">Attendance recorded for today</span>
                )}
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin size={13} /> Time is stamped by the server and your location is captured for verification. A 1-hour lunch break is deducted for shifts over 5 hours.
            </p>
            {error && (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-rose-600">
                <AlertCircle size={15} /> {error}
              </p>
            )}
          </div>
        )
      )}

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
