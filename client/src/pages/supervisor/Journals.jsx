import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, XCircle } from "lucide-react";
import api from "../../api";
import { Badge, Spinner, EmptyState, PageHeader, Avatar } from "../../components/ui.jsx";

export default function SupervisorJournals() {
  const [journals, setJournals] = useState(null);
  const [feedback, setFeedback] = useState({});

  const load = () => api.get("/journals").then((res) => setJournals(res.data));
  useEffect(() => { load(); }, []);

  const review = async (id, status) => {
    try {
      await api.patch(`/journals/${id}/review`, { status, feedback: feedback[id] || "" });
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Could not review journal");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Journal Review" subtitle="Review and approve your interns' daily journals." />
      {journals === null ? <Spinner /> : journals.length === 0 ? (
        <div className="card"><EmptyState icon={BookOpen} title="No journals" hint="Journals will appear once interns submit them." /></div>
      ) : (
        <div className="grid gap-4">
          {journals.map((j) => (
            <div key={j.id} className="card p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={j.intern_name} size="sm" />
                  <div>
                    <h3 className="font-semibold text-slate-800">{j.intern_name}</h3>
                    <p className="text-xs text-slate-400">{j.date}</p>
                  </div>
                </div>
                <Badge status={j.status} />
              </div>
              <p className="mb-4 whitespace-pre-wrap text-slate-700">{j.accomplishments}</p>
              <div className="flex items-end gap-3">
                <input
                  className="input flex-1"
                  placeholder="Feedback"
                  value={feedback[j.id] || ""}
                  onChange={(e) => setFeedback({ ...feedback, [j.id]: e.target.value })}
                />
                <button onClick={() => review(j.id, "approved")} className="btn-success"><CheckCircle2 size={16} /> Approve</button>
                <button onClick={() => review(j.id, "rejected")} className="btn-danger"><XCircle size={16} /> Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
