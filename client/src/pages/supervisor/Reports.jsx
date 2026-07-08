import { useEffect, useState } from "react";
import {
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import api from "../../api";
import { Badge, Modal, Spinner, EmptyState, PageHeader, Avatar } from "../../components/ui.jsx";

const tabs = [
  { key: "all", label: "All" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "narrative", label: "Narrative" },
  { key: "final", label: "Final" },
];

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  return isNaN(date) ? d : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default function SupervisorReports() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [comments, setComments] = useState({});
  const [remarks, setRemarks] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([
      api.get("/weekly-reports"),
      api.get("/monthly-reports"),
      api.get("/reports"),
      api.get("/final-reports"),
    ]).then(([weekly, monthly, narrative, final]) => {
      const weeklyItems = weekly.data.map((r) => ({ ...r, type: "weekly", submitted_at: r.created_at }));
      const monthlyItems = monthly.data.map((r) => ({ ...r, type: "monthly", submitted_at: r.created_at }));
      const narrativeItems = narrative.data.map((r) => ({ ...r, type: "narrative", submitted_at: r.created_at }));
      const finalItems = final.data.map((r) => ({ ...r, type: "final", submitted_at: r.created_at }));
      setItems([...weeklyItems, ...monthlyItems, ...narrativeItems, ...finalItems].sort((a, b) => new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0)));
    });
  };
  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? items : (items || []).filter((i) => i.type === filter);

  const isFinalized = (status) => status && status !== "pending";

  const openReview = (r) => {
    setActive(r);
    setFeedback(r.feedback || "");
  };

  const reviewReport = async (r, status) => {
    if (!r) return;
    setSaving(true);
    try {
      const { type, id } = r;
      const payload = { status };
      if (type === "weekly") payload.comments = comments[id] || "";
      else if (type === "monthly") payload.supervisor_remarks = remarks[id] || "";
      else if (type === "narrative") payload.feedback = feedback;
      await api.patch(`/${type === "narrative" ? "reports" : type + "-reports"}/${id}/review`, payload);
      setActive(null);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Could not review report");
    } finally {
      setSaving(false);
    }
  };

  const typeBadge = (type) => {
    const styles = {
      weekly: "bg-blue-100 text-blue-700",
      monthly: "bg-purple-100 text-purple-700",
      narrative: "bg-amber-100 text-amber-700",
      final: "bg-emerald-100 text-emerald-700",
    };
    return (
      <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[type] || "bg-slate-100 text-slate-600"}`}>
        {type === "narrative" ? "Narrative Report" : `${type} Report`}
      </span>
    );
  };

  const renderReport = (r) => {
    const finalized = isFinalized(r.status);

    if (r.type === "weekly") {
      return (
        <div className="card p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={r.intern_name} size="sm" />
              <div>
                <h3 className="font-semibold text-slate-800">{r.intern_name}</h3>
                <p className="text-xs text-slate-400">Week {r.week_number}{r.title ? ` · ${r.title}` : ""} · Submitted {formatDate(r.submitted_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {typeBadge(r.type)}
              <Badge status={r.status} />
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            <p className="whitespace-pre-wrap"><strong className="text-slate-900">Accomplishments:</strong><br />{r.accomplishments}</p>
            {r.reflection && <p className="whitespace-pre-wrap"><strong className="text-slate-900">Reflection:</strong><br />{r.reflection}</p>}
            {r.problems && <p className="whitespace-pre-wrap"><strong className="text-slate-900">Problems:</strong><br />{r.problems}</p>}
            {r.solutions && <p className="whitespace-pre-wrap"><strong className="text-slate-900">Solutions:</strong><br />{r.solutions}</p>}
          </div>
          {r.supervisor_comments && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Comments: {r.supervisor_comments}</p>}
          {!finalized && (
            <div className="mt-4 flex items-end gap-3">
              <input className="input flex-1" placeholder="Comments / feedback" value={comments[r.id] || ""} onChange={(e) => setComments({ ...comments, [r.id]: e.target.value })} />
              <button onClick={() => reviewReport(r, "approved")} className="btn-success" disabled={saving}><CheckCircle2 size={16} /> Approve</button>
              <button onClick={() => reviewReport(r, "needs_revision")} className="btn-ghost text-amber-600 border-amber-200 hover:bg-amber-50" disabled={saving}><XCircle size={16} /> Revise</button>
            </div>
          )}
        </div>
      );
    }
    if (r.type === "monthly") {
      return (
        <div className="card p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={r.intern_name} size="sm" />
              <div>
                <h3 className="font-semibold text-slate-800">{r.intern_name}</h3>
                <p className="text-xs text-slate-400">{r.month} · Submitted {formatDate(r.submitted_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {typeBadge(r.type)}
              <Badge status={r.status} />
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            <p className="whitespace-pre-wrap"><strong className="text-slate-900">Summary:</strong><br />{r.summary}</p>
            <p><strong className="text-slate-900">Hours rendered:</strong> {r.hours_rendered}</p>
            {r.performance && <p className="whitespace-pre-wrap"><strong className="text-slate-900">Performance:</strong><br />{r.performance}</p>}
            {r.learning_outcomes && <p className="whitespace-pre-wrap"><strong className="text-slate-900">Learning outcomes:</strong><br />{r.learning_outcomes}</p>}
          </div>
          {r.supervisor_remarks && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Remarks: {r.supervisor_remarks}</p>}
          {!finalized && (
            <div className="mt-4 flex items-end gap-3">
              <input className="input flex-1" placeholder="Remarks" value={remarks[r.id] || ""} onChange={(e) => setRemarks({ ...remarks, [r.id]: e.target.value })} />
              <button onClick={() => reviewReport(r, "approved")} className="btn-success" disabled={saving}><CheckCircle2 size={16} /> Approve</button>
              <button onClick={() => reviewReport(r, "needs_revision")} className="btn-ghost text-amber-600 border-amber-200 hover:bg-amber-50" disabled={saving}><XCircle size={16} /> Revise</button>
            </div>
          )}
        </div>
      );
    }
    if (r.type === "narrative") {
      return (
        <button onClick={() => openReview(r)} className="card p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-glow">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <Avatar name={r.intern_name} size="sm" />
              <div>
                <h3 className="font-semibold text-slate-800">{r.title}</h3>
                <p className="text-xs text-slate-400">{r.intern_name} · {r.week_number ? `Week ${r.week_number} · ` : ""}Submitted {formatDate(r.submitted_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {typeBadge(r.type)}
              <Badge status={r.status} />
            </div>
          </div>
          <p className="line-clamp-3 text-sm text-slate-600">{r.content}</p>
        </button>
      );
    }
    // final
    return (
      <div className="card p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={r.intern_name} size="sm" />
            <div>
              <h3 className="font-semibold text-slate-800">{r.intern_name}</h3>
              <p className="text-xs text-slate-400">Submitted {formatDate(r.submitted_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {typeBadge(r.type)}
            <Badge status={r.status} />
          </div>
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
        {!finalized && (
          <div className="mt-4 flex gap-2">
            <button onClick={() => reviewReport(r, "approved")} className="btn-success" disabled={saving}><CheckCircle2 size={16} /> Approve</button>
            <button onClick={() => reviewReport(r, "rejected")} className="btn-danger" disabled={saving}><XCircle size={16} /> Reject</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports Review" subtitle="Review and approve all intern reports in one place." />

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === t.key
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {items === null ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={FileText} title="No reports" hint="No reports match this filter." /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((r) => (
            <div key={`${r.type}-${r.id}`}>{renderReport(r)}</div>
          ))}
        </div>
      )}

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.title}
        footer={
          active && !isFinalized(active.status) ? (
            <>
              <button className="btn-ghost" onClick={() => reviewReport(active, "needs_revision")} disabled={saving}>Needs revision</button>
              <button className="btn-primary" onClick={() => reviewReport(active, "approved")} disabled={saving}>Approve</button>
            </>
          ) : (
            <button className="btn-ghost" onClick={() => setActive(null)}>Close</button>
          )
        }
      >
        {active && (
          <>
            <div className="mb-3 flex items-center gap-2">
              {typeBadge(active.type)}
              <p className="text-xs text-slate-400">By {active.intern_name} · Submitted {formatDate(active.submitted_at)}</p>
            </div>
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
