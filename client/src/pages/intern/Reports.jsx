import { useEffect, useState } from "react";
import {
  FileText,
  Calendar,
  CheckCircle,
  MessageSquareQuote,
  Trash2,
  Plus,
  Send,
} from "lucide-react";
import api from "../../api";
import { Badge, Spinner, EmptyState, PageHeader, Modal } from "../../components/ui.jsx";

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

export default function InternReports() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [tabForNew, setTabForNew] = useState("narrative");
  const [saving, setSaving] = useState(false);

  // Weekly form
  const [weeklyForm, setWeeklyForm] = useState({
    week_number: 1,
    title: "",
    accomplishments: "",
    reflection: "",
    problems: "",
    solutions: "",
    file_urls: "",
  });
  // Monthly form
  const [monthlyForm, setMonthlyForm] = useState({
    month: "",
    summary: "",
    hours_rendered: "",
    performance: "",
    learning_outcomes: "",
  });
  // Narrative form
  const [narrativeForm, setNarrativeForm] = useState({ title: "", week_number: "", content: "" });
  const [editingNarrative, setEditingNarrative] = useState(null);
  // Final form
  const [finalForm, setFinalForm] = useState({
    narrative_report: "",
    terminal_report: "",
    presentation_url: "",
    final_documentation_url: "",
    completion_form_url: "",
    certificate_url: "",
  });
  const [finalReport, setFinalReport] = useState(null);

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
      if (final.data[0]) {
        setFinalReport(final.data[0]);
        setFinalForm({
          narrative_report: final.data[0].narrative_report || "",
          terminal_report: final.data[0].terminal_report || "",
          presentation_url: final.data[0].presentation_url || "",
          final_documentation_url: final.data[0].final_documentation_url || "",
          completion_form_url: final.data[0].completion_form_url || "",
          certificate_url: final.data[0].certificate_url || "",
        });
      }
    });
  };
  useEffect(() => { load(); }, []);

  const filtered = filter === "all" ? items : (items || []).filter((i) => i.type === filter);

  const remove = async (type, id) => {
    if (!confirm("Delete this report?")) return;
    const endpoint = type === "narrative" ? `/reports/${id}` : `/${type}-reports/${id}`;
    await api.delete(endpoint);
    load();
  };

  const openNew = (type) => {
    setTabForNew(type);
    setEditingNarrative(null);
    setNarrativeForm({ title: "", week_number: "", content: "" });
    setWeeklyForm({ week_number: 1, title: "", accomplishments: "", reflection: "", problems: "", solutions: "", file_urls: "" });
    setMonthlyForm({ month: "", summary: "", hours_rendered: "", performance: "", learning_outcomes: "" });
    setOpen(true);
  };

  const openEditNarrative = (r) => {
    setTabForNew("narrative");
    setEditingNarrative(r.id);
    setNarrativeForm({ title: r.title, week_number: r.week_number || "", content: r.content });
    setOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    try {
      if (tabForNew === "weekly") {
        await api.post("/weekly-reports", {
          ...weeklyForm,
          week_number: Number(weeklyForm.week_number),
          file_urls: weeklyForm.file_urls.split(",").map((s) => s.trim()).filter(Boolean),
        });
      } else if (tabForNew === "monthly") {
        await api.post("/monthly-reports", { ...monthlyForm, hours_rendered: Number(monthlyForm.hours_rendered) || 0 });
      } else if (tabForNew === "narrative") {
        if (editingNarrative) await api.put(`/reports/${editingNarrative}`, narrativeForm);
        else await api.post("/reports", narrativeForm);
      } else if (tabForNew === "final") {
        if (finalReport) await api.put("/final-reports", finalForm);
        else await api.post("/final-reports", finalForm);
      }
      setOpen(false);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Could not save report");
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
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[type] || "bg-slate-100 text-slate-600"}`}>
        {type === "narrative" ? "Narrative Report" : `${type} Report`}
      </span>
    );
  };

  const renderReport = (r) => {
    if (r.type === "weekly") {
      return (
        <div className="card p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-blue-600" />
              <div>
                <h3 className="font-semibold text-slate-800">Week {r.week_number}{r.title ? ` · ${r.title}` : ""}</h3>
                <p className="text-xs text-slate-400">Submitted {formatDate(r.submitted_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {typeBadge(r.type)}
              <Badge status={r.status} />
              <button onClick={() => remove(r.type, r.id)} className="text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            <p className="whitespace-pre-wrap"><strong className="text-slate-900">Accomplishments:</strong><br />{r.accomplishments}</p>
            {r.reflection && <p className="whitespace-pre-wrap"><strong className="text-slate-900">Reflection:</strong><br />{r.reflection}</p>}
            {r.problems && <p className="whitespace-pre-wrap"><strong className="text-slate-900">Problems:</strong><br />{r.problems}</p>}
            {r.solutions && <p className="whitespace-pre-wrap"><strong className="text-slate-900">Solutions:</strong><br />{r.solutions}</p>}
          </div>
          {r.supervisor_comments && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Comments: {r.supervisor_comments}</p>}
        </div>
      );
    }
    if (r.type === "monthly") {
      return (
        <div className="card p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-purple-600" />
              <div>
                <h3 className="font-semibold text-slate-800">{r.month}</h3>
                <p className="text-xs text-slate-400">Submitted {formatDate(r.submitted_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {typeBadge(r.type)}
              <Badge status={r.status} />
              <button onClick={() => remove(r.type, r.id)} className="text-slate-400 hover:text-rose-600"><Trash2 size={16} /></button>
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            <p className="whitespace-pre-wrap"><strong className="text-slate-900">Summary:</strong><br />{r.summary}</p>
            <p><strong className="text-slate-900">Hours rendered:</strong> {r.hours_rendered}</p>
            {r.performance && <p className="whitespace-pre-wrap"><strong className="text-slate-900">Performance:</strong><br />{r.performance}</p>}
            {r.learning_outcomes && <p className="whitespace-pre-wrap"><strong className="text-slate-900">Learning outcomes:</strong><br />{r.learning_outcomes}</p>}
          </div>
          {r.supervisor_remarks && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Remarks: {r.supervisor_remarks}</p>}
        </div>
      );
    }
    if (r.type === "narrative") {
      return (
        <div className="card p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <MessageSquareQuote size={18} className="text-amber-600" />
              <div>
                <h3 className="font-semibold text-slate-800">{r.title}</h3>
                <p className="text-xs text-slate-400">
                  {r.week_number ? `Week ${r.week_number} · ` : ""}Submitted {formatDate(r.submitted_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {typeBadge(r.type)}
              <Badge status={r.status} />
            </div>
          </div>
          <p className="mb-3 whitespace-pre-wrap text-sm text-slate-600 line-clamp-5">{r.content}</p>
          {r.feedback && (
            <div className="mb-3 rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
              <p className="mb-1 font-medium">Supervisor feedback</p>
              {r.feedback}
            </div>
          )}
          <div className="flex gap-2">
            {r.status !== "approved" && (
              <button className="btn-ghost" onClick={() => openEditNarrative(r)}>Edit & resubmit</button>
            )}
            <button onClick={() => remove(r.type, r.id)} className="btn-ghost text-rose-600"><Trash2 size={16} /></button>
          </div>
        </div>
      );
    }
    // final
    return (
      <div className="card p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle size={18} className="text-emerald-600" />
            <div>
              <h3 className="font-semibold text-slate-800">Final Report</h3>
              <p className="text-xs text-slate-400">Submitted {formatDate(r.submitted_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {typeBadge(r.type)}
            <Badge status={r.status} />
          </div>
        </div>
        <div className="grid gap-2 text-sm text-slate-700">
          {r.narrative_report && <p><strong>Narrative report:</strong> {r.narrative_report}</p>}
          {r.terminal_report && <p><strong>Terminal report:</strong> {r.terminal_report}</p>}
          {r.presentation_url && <p><strong>Presentation URL:</strong> {r.presentation_url}</p>}
          {r.final_documentation_url && <p><strong>Documentation URL:</strong> {r.final_documentation_url}</p>}
          {r.completion_form_url && <p><strong>Completion form URL:</strong> {r.completion_form_url}</p>}
          {r.certificate_url && <p><strong>Certificate URL:</strong> {r.certificate_url}</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="All your weekly, monthly, narrative, and final reports in one place.">
        <div className="flex items-center gap-2">
          <button className="btn-primary" onClick={() => openNew("narrative")}><Plus size={16} /> New report</button>
        </div>
      </PageHeader>

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

      {items === null ? <Spinner /> : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={FileText} title="No reports" hint="Submit your first report using the New report button." /></div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((r) => <div key={`${r.type}-${r.id}`}>{renderReport(r)}</div>)}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editingNarrative ? "Edit narrative report" : "New report"}
        footer={<>
          <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={saving}>
            {saving ? "Saving..." : <><Send size={16} /> Submit</>}
          </button>
        </>}
      >
        {!editingNarrative && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tabs.filter((t) => t.key !== "all").map((t) => (
              <button
                key={t.key}
                onClick={() => setTabForNew(t.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  tabForNew === t.key ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {tabForNew === "weekly" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Week number</label><input className="input" type="number" min={1} value={weeklyForm.week_number} onChange={(e) => setWeeklyForm({ ...weeklyForm, week_number: e.target.value })} /></div>
              <div><label className="label">Title</label><input className="input" value={weeklyForm.title} onChange={(e) => setWeeklyForm({ ...weeklyForm, title: e.target.value })} /></div>
            </div>
            <div><label className="label">Accomplishments</label><textarea className="input min-h-[100px]" value={weeklyForm.accomplishments} onChange={(e) => setWeeklyForm({ ...weeklyForm, accomplishments: e.target.value })} /></div>
            <div><label className="label">Reflection</label><textarea className="input min-h-[80px]" value={weeklyForm.reflection} onChange={(e) => setWeeklyForm({ ...weeklyForm, reflection: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Problems</label><textarea className="input min-h-[80px]" value={weeklyForm.problems} onChange={(e) => setWeeklyForm({ ...weeklyForm, problems: e.target.value })} /></div>
              <div><label className="label">Solutions</label><textarea className="input min-h-[80px]" value={weeklyForm.solutions} onChange={(e) => setWeeklyForm({ ...weeklyForm, solutions: e.target.value })} /></div>
            </div>
            <div><label className="label">File URLs (comma separated)</label><input className="input" value={weeklyForm.file_urls} onChange={(e) => setWeeklyForm({ ...weeklyForm, file_urls: e.target.value })} /></div>
          </div>
        )}

        {tabForNew === "monthly" && (
          <div className="space-y-3">
            <div><label className="label">Month</label><input className="input" value={monthlyForm.month} onChange={(e) => setMonthlyForm({ ...monthlyForm, month: e.target.value })} placeholder="June 2026" /></div>
            <div><label className="label">Hours rendered</label><input className="input" type="number" value={monthlyForm.hours_rendered} onChange={(e) => setMonthlyForm({ ...monthlyForm, hours_rendered: e.target.value })} /></div>
            <div><label className="label">Summary</label><textarea className="input min-h-[100px]" value={monthlyForm.summary} onChange={(e) => setMonthlyForm({ ...monthlyForm, summary: e.target.value })} /></div>
            <div><label className="label">Performance</label><textarea className="input min-h-[80px]" value={monthlyForm.performance} onChange={(e) => setMonthlyForm({ ...monthlyForm, performance: e.target.value })} /></div>
            <div><label className="label">Learning outcomes</label><textarea className="input min-h-[80px]" value={monthlyForm.learning_outcomes} onChange={(e) => setMonthlyForm({ ...monthlyForm, learning_outcomes: e.target.value })} /></div>
          </div>
        )}

        {tabForNew === "narrative" && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2"><label className="label">Title</label><input className="input" value={narrativeForm.title} onChange={(e) => setNarrativeForm({ ...narrativeForm, title: e.target.value })} placeholder="e.g. Weekly accomplishments" /></div>
              <div><label className="label">Week #</label><input className="input" type="number" value={narrativeForm.week_number} onChange={(e) => setNarrativeForm({ ...narrativeForm, week_number: e.target.value })} min={1} /></div>
            </div>
            <div><label className="label">Narrative</label><textarea className="input min-h-[160px]" value={narrativeForm.content} onChange={(e) => setNarrativeForm({ ...narrativeForm, content: e.target.value })} placeholder="Describe what you did, learned, and accomplished..." /></div>
          </div>
        )}

        {tabForNew === "final" && (
          <div className="space-y-3">
            <div><label className="label">Narrative report</label><textarea className="input min-h-[120px]" value={finalForm.narrative_report} onChange={(e) => setFinalForm({ ...finalForm, narrative_report: e.target.value })} placeholder="Paste narrative report URL or text..." /></div>
            <div><label className="label">Terminal report</label><textarea className="input min-h-[80px]" value={finalForm.terminal_report} onChange={(e) => setFinalForm({ ...finalForm, terminal_report: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Presentation URL</label><input className="input" value={finalForm.presentation_url} onChange={(e) => setFinalForm({ ...finalForm, presentation_url: e.target.value })} /></div>
              <div><label className="label">Final documentation URL</label><input className="input" value={finalForm.final_documentation_url} onChange={(e) => setFinalForm({ ...finalForm, final_documentation_url: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Completion form URL</label><input className="input" value={finalForm.completion_form_url} onChange={(e) => setFinalForm({ ...finalForm, completion_form_url: e.target.value })} /></div>
              <div><label className="label">Certificate URL</label><input className="input" value={finalForm.certificate_url} onChange={(e) => setFinalForm({ ...finalForm, certificate_url: e.target.value })} /></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
