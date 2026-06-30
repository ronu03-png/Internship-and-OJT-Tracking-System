import { useEffect, useState } from "react";
import { FileCheck, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import api from "../../api";
import { Spinner, EmptyState, PageHeader, Avatar, Badge } from "../../components/ui.jsx";

export default function SupervisorFinalReports() {
  const [reports, setReports] = useState(null);

  const load = () => api.get("/final-reports").then((res) => setReports(res.data));
  useEffect(() => { load(); }, []);

  const review = async (id, status) => {
    try {
      await api.patch(`/final-reports/${id}/review`, { status });
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Could not review report");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Final Reports" subtitle="Review and approve final OJT documentation." />
      {reports === null ? <Spinner /> : reports.length === 0 ? (
        <div className="card"><EmptyState icon={FileCheck} title="No final reports" hint="Final reports will appear once interns submit them." /></div>
      ) : (
        <div className="grid gap-4">
          {reports.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={r.intern_name} size="sm" />
                  <h3 className="font-semibold text-slate-800">{r.intern_name}</h3>
                </div>
                <Badge status={r.status} />
              </div>
              <div className="space-y-2 text-sm text-slate-700">
                {r.narrative_report && <p><strong className="text-slate-900">Narrative:</strong> {r.narrative_report}</p>}
                {r.terminal_report && <p><strong className="text-slate-900">Terminal:</strong> {r.terminal_report}</p>}
                <div className="flex flex-wrap gap-2">
                  {r.presentation_url && <a href={r.presentation_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline"><ExternalLink size={14} /> Presentation</a>}
                  {r.final_documentation_url && <a href={r.final_documentation_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline"><ExternalLink size={14} /> Documentation</a>}
                  {r.completion_form_url && <a href={r.completion_form_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline"><ExternalLink size={14} /> Completion form</a>}
                  {r.certificate_url && <a href={r.certificate_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline"><ExternalLink size={14} /> Certificate</a>}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => review(r.id, "approved")} className="btn-success"><CheckCircle2 size={16} /> Approve</button>
                <button onClick={() => review(r.id, "rejected")} className="btn-danger"><XCircle size={16} /> Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
