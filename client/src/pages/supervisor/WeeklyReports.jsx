import { useEffect, useState } from "react";
import { FileText, CheckCircle2, XCircle } from "lucide-react";
import api from "../../api";
import { Badge, Spinner, EmptyState, PageHeader, Avatar } from "../../components/ui.jsx";

export default function SupervisorWeeklyReports() {
  const [reports, setReports] = useState(null);
  const [comments, setComments] = useState({});

  const load = () => api.get("/weekly-reports").then((res) => setReports(res.data));
  useEffect(() => { load(); }, []);

  const review = async (id, status) => {
    try {
      await api.patch(`/weekly-reports/${id}/review`, { status, comments: comments[id] || "" });
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Could not review report");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Weekly Reports" subtitle="Review and provide feedback on intern weekly reports." />
      {reports === null ? <Spinner /> : reports.length === 0 ? (
        <div className="card"><EmptyState icon={FileText} title="No reports" hint="Reports will appear once interns submit them." /></div>
      ) : (
        <div className="grid gap-4">
          {reports.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={r.intern_name} size="sm" />
                  <div>
                    <h3 className="font-semibold text-slate-800">{r.intern_name}</h3>
                    <p className="text-xs text-slate-400">Week {r.week_number}{r.title ? ` · ${r.title}` : ""}</p>
                  </div>
                </div>
                <Badge status={r.status} />
              </div>
              <div className="space-y-3 text-slate-700">
                <p className="whitespace-pre-wrap"><strong className="text-slate-900">Accomplishments:</strong><br/>{r.accomplishments}</p>
                {r.reflection && <p className="whitespace-pre-wrap"><strong className="text-slate-900">Reflection:</strong><br/>{r.reflection}</p>}
                {r.problems && <p className="whitespace-pre-wrap"><strong className="text-slate-900">Problems:</strong><br/>{r.problems}</p>}
                {r.solutions && <p className="whitespace-pre-wrap"><strong className="text-slate-900">Solutions:</strong><br/>{r.solutions}</p>}
              </div>
              <div className="mt-4 flex items-end gap-3">
                <input
                  className="input flex-1"
                  placeholder="Comments / feedback"
                  value={comments[r.id] || ""}
                  onChange={(e) => setComments({ ...comments, [r.id]: e.target.value })}
                />
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
