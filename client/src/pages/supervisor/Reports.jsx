import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import api from "../../api";
import { Badge, Modal, Spinner, EmptyState, PageHeader } from "../../components/ui.jsx";

export default function SupervisorReports() {
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [active, setActive] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/reports").then((res) => setRows(res.data));
  useEffect(() => { load(); }, []);

  const openReview = (r) => { setActive(r); setFeedback(r.feedback || ""); };

  const review = async (status) => {
    setSaving(true);
    try {
      await api.patch(`/reports/${active.id}/review`, { status, feedback });
      setActive(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const filtered = (rows || []).filter((r) => filter === "all" || r.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports Review" subtitle="Review and give feedback on intern narrative reports.">
        <select className="input w-44" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="needs_revision">Needs revision</option>
          <option value="all">All</option>
        </select>
      </PageHeader>

      {rows === null ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={FileText} title="No reports" hint="No reports match this filter." /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((r) => (
            <button key={r.id} onClick={() => openReview(r)} className="card p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-glow">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-800">{r.title}</h3>
                  <p className="text-xs text-slate-400">{r.intern_name} · {r.week_number ? `Week ${r.week_number} · ` : ""}{r.created_at?.slice(0, 10)}</p>
                </div>
                <Badge status={r.status} />
              </div>
              <p className="line-clamp-3 text-sm text-slate-600">{r.content}</p>
            </button>
          ))}
        </div>
      )}

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.title}
        footer={
          <>
            <button className="btn-ghost" onClick={() => review("needs_revision")} disabled={saving}>Needs revision</button>
            <button className="btn-primary" onClick={() => review("approved")} disabled={saving}>Approve</button>
          </>
        }
      >
        {active && (
          <>
            <p className="text-xs text-slate-400">By {active.intern_name} · {active.created_at?.slice(0, 10)}</p>
            <div className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              {active.content}
            </div>
            <div>
              <label className="label">Feedback (optional)</label>
              <textarea className="input min-h-[90px]" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Comments for the intern..." />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
