import { useEffect, useState } from "react";
import { Calendar, CheckCircle2, XCircle } from "lucide-react";
import api from "../../api";
import { Badge, Spinner, EmptyState, PageHeader, Avatar } from "../../components/ui.jsx";

export default function SupervisorMonthlyReports() {
  const [reports, setReports] = useState(null);
  const [remarks, setRemarks] = useState({});

  const load = () => api.get("/monthly-reports").then((res) => setReports(res.data));
  useEffect(() => { load(); }, []);

  const review = async (id, status) => {
    try {
      await api.patch(`/monthly-reports/${id}/review`, { status, supervisor_remarks: remarks[id] || "" });
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Could not review report");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Monthly Reports" subtitle="Review intern monthly reports and learning outcomes." />
      {reports === null ? <Spinner /> : reports.length === 0 ? (
        <div className="card"><EmptyState icon={Calendar} title="No reports" hint="Reports will appear once interns submit them." /></div>
      ) : (
        <div className="grid gap-4">
          {reports.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={r.intern_name} size="sm" />
                  <div>
                    <h3 className="font-semibold text-slate-800">{r.intern_name}</h3>
                    <p className="text-xs text-slate-400">{r.month}</p>
                  </div>
                </div>
                <Badge status={r.status} />
              </div>
              <div className="space-y-2 text-sm text-slate-700">
                <p className="whitespace-pre-wrap"><strong className="text-slate-900">Summary:</strong><br/>{r.summary}</p>
                <p><strong className="text-slate-900">Hours rendered:</strong> {r.hours_rendered}</p>
                {r.performance && <p className="whitespace-pre-wrap"><strong className="text-slate-900">Performance:</strong><br/>{r.performance}</p>}
                {r.learning_outcomes && <p className="whitespace-pre-wrap"><strong className="text-slate-900">Learning outcomes:</strong><br/>{r.learning_outcomes}</p>}
              </div>
              <div className="mt-4 flex items-end gap-3">
                <input className="input flex-1" placeholder="Remarks" value={remarks[r.id] || ""} onChange={(e) => setRemarks({ ...remarks, [r.id]: e.target.value })} />
                <button onClick={() => review(r.id, "approved")} className="btn-success"><CheckCircle2 size={16} /> Approve</button>
                <button onClick={() => review(r.id, "needs_revision")} className="btn-ghost text-amber-600 border-amber-200 hover:bg-amber-50"><XCircle size={16} /> Revise</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
