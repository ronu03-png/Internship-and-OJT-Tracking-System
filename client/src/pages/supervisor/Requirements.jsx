import { useEffect, useMemo, useState } from "react";
import { FileCheck2, ExternalLink, Search, Download } from "lucide-react";
import api from "../../api";
import { Badge, Modal, Spinner, EmptyState, PageHeader } from "../../components/ui.jsx";
import { exportToExcel } from "../../utils/exportExcel.js";

export default function SupervisorRequirements() {
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/requirements").then((res) => setRows(res.data));
  useEffect(() => { load(); }, []);

  const openReview = (r) => { setActive(r); setFeedback(r.feedback || ""); };

  const review = async (status) => {
    setSaving(true);
    try {
      await api.patch(`/requirements/${active.id}/review`, { status, feedback });
      setActive(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => (rows || []).filter((r) => {
    const q = search.toLowerCase();
    return (filter === "all" || r.status === filter) && (r.name.toLowerCase().includes(q) || (r.intern_name || "").toLowerCase().includes(q));
  }), [rows, filter, search]);

  const exportRequirements = () => {
    exportToExcel({
      data: filtered,
      headers: [
        { key: "name", label: "Name" },
        { key: "intern_name", label: "Intern" },
        { key: "status", label: "Status" },
        { key: "note", label: "Note" },
      ],
      filename: "requirements",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Requirements Review" subtitle={`${filtered.length} OJT documents to review`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input pl-9" placeholder="Search requirements..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <select className="input w-44" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="submitted">Submitted</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={exportRequirements} className="btn-ghost"><Download size={16} /> Export</button>
        </div>
      </PageHeader>

      {rows === null ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={FileCheck2} title="Nothing here" hint="No requirements match this filter." /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((r) => (
            <button key={r.id} onClick={() => openReview(r)} className="card p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-glow">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-800">{r.name}</h3>
                  <p className="text-xs text-slate-400">{r.intern_name} · {r.created_at?.slice(0, 10)}</p>
                </div>
                <Badge status={r.status} />
              </div>
              {r.note && <p className="line-clamp-2 text-sm text-slate-600">{r.note}</p>}
            </button>
          ))}
        </div>
      )}

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active?.name}
        footer={
          <>
            <button className="btn-ghost text-rose-600" onClick={() => review("rejected")} disabled={saving}>Reject</button>
            <button className="btn-primary" onClick={() => review("approved")} disabled={saving}>Approve</button>
          </>
        }
      >
        {active && (
          <>
            <p className="text-xs text-slate-400">By {active.intern_name} · {active.created_at?.slice(0, 10)}</p>
            {active.note && (
              <div className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{active.note}</div>
            )}
            {active.link && (
              <a href={active.link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline">
                <ExternalLink size={14} /> Open submitted document
              </a>
            )}
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
