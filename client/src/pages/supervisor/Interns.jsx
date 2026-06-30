import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import api from "../../api";
import { Spinner, EmptyState, Avatar, ProgressBar, PageHeader } from "../../components/ui.jsx";

export default function SupervisorInterns() {
  const [interns, setInterns] = useState(null);

  useEffect(() => {
    api.get("/stats/interns").then((res) => setInterns(res.data));
  }, []);

  if (interns === null) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="My Interns" subtitle="Everyone interning under your company." />
      {interns.length === 0 ? (
        <div className="card"><EmptyState icon={Users} title="No interns yet" hint="Interns select your company when they register." /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {interns.map((i) => (
            <div key={i.id} className="card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow">
              <div className="mb-3 flex items-center gap-3">
                <Avatar name={i.full_name} size="md" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-800">{i.full_name}</p>
                  <p className="truncate text-xs text-slate-400">{i.course || i.position || "Intern"}</p>
                </div>
              </div>
              <p className="mb-3 truncate text-xs text-slate-400">{i.email}</p>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-slate-500">Hours</span>
                <span className="font-semibold text-slate-700">{i.approved_hours}/{i.required_hours}</span>
              </div>
              <ProgressBar value={i.progress} size="md" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
