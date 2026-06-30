import { useEffect, useState } from "react";
import { FileCheck, Save, CheckCircle2 } from "lucide-react";
import api from "../../api";
import { Spinner, EmptyState, PageHeader, Badge } from "../../components/ui.jsx";

const blank = {
  narrative_report: "",
  terminal_report: "",
  presentation_url: "",
  final_documentation_url: "",
  completion_form_url: "",
  certificate_url: "",
};

export default function InternFinalReports() {
  const [report, setReport] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get("/final-reports").then((res) => {
      const data = res.data[0];
      setReport(data || null);
      if (data) {
        setForm({
          narrative_report: data.narrative_report || "",
          terminal_report: data.terminal_report || "",
          presentation_url: data.presentation_url || "",
          final_documentation_url: data.final_documentation_url || "",
          completion_form_url: data.completion_form_url || "",
          certificate_url: data.certificate_url || "",
        });
      }
    });
  };
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setSaving(true);
    try {
      if (report) {
        await api.put("/final-reports", form);
      } else {
        await api.post("/final-reports", form);
      }
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Could not save final report");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Final Report" subtitle="Upload and submit your final OJT documentation." />
      {report === null && form === blank ? <Spinner /> : (
        <div className="card max-w-3xl p-6 space-y-4">
          {report && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-slate-500">Status:</span>
              <Badge status={report.status} />
            </div>
          )}
          <div>
            <label className="label">Narrative report</label>
            <textarea className="input min-h-[120px]" value={form.narrative_report} onChange={set("narrative_report")} placeholder="Paste narrative report URL or text..." />
          </div>
          <div>
            <label className="label">Terminal report</label>
            <textarea className="input min-h-[80px]" value={form.terminal_report} onChange={set("terminal_report")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Presentation URL</label><input className="input" value={form.presentation_url} onChange={set("presentation_url")} /></div>
            <div><label className="label">Final documentation URL</label><input className="input" value={form.final_documentation_url} onChange={set("final_documentation_url")} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Completion form URL</label><input className="input" value={form.completion_form_url} onChange={set("completion_form_url")} /></div>
            <div><label className="label">Certificate URL</label><input className="input" value={form.certificate_url} onChange={set("certificate_url")} /></div>
          </div>
          <button className="btn-primary mt-2" onClick={submit} disabled={saving}>
            <Save size={16} /> {saving ? "Saving..." : report ? "Update final report" : "Submit final report"}
          </button>
        </div>
      )}
    </div>
  );
}
