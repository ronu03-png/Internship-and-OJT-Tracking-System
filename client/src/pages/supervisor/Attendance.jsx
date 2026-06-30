import { useEffect, useState } from "react";
import { Check, X, CalendarClock } from "lucide-react";
import api from "../../api";
import { Badge, Spinner, EmptyState, PageHeader } from "../../components/ui.jsx";

export default function SupervisorAttendance() {
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState("pending");

  const load = () => api.get("/attendance").then((res) => setRows(res.data));
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    await api.patch(`/attendance/${id}/status`, { status });
    load();
  };

  const filtered = (rows || []).filter((r) => filter === "all" || r.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance Review" subtitle="Approve or reject the days your interns logged.">
        <select className="input w-44" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </PageHeader>

      <div className="card overflow-hidden">
        {rows === null ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState icon={CalendarClock} title="Nothing here" hint="No attendance records match this filter." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Intern</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">In</th>
                <th className="px-4 py-3">Out</th>
                <th className="px-4 py-3">Hours</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.id} className="transition hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium text-slate-700">{r.intern_name}</td>
                  <td className="px-4 py-3">{r.date}</td>
                  <td className="px-4 py-3">{r.time_in || "—"}</td>
                  <td className="px-4 py-3">{r.time_out || "—"}</td>
                  <td className="px-4 py-3 font-semibold">{r.hours}</td>
                  <td className="px-4 py-3"><Badge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setStatus(r.id, "approved")} className="rounded-lg bg-emerald-100 p-1.5 text-emerald-700 hover:bg-emerald-200" title="Approve">
                        <Check size={16} />
                      </button>
                      <button onClick={() => setStatus(r.id, "rejected")} className="rounded-lg bg-rose-100 p-1.5 text-rose-700 hover:bg-rose-200" title="Reject">
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
