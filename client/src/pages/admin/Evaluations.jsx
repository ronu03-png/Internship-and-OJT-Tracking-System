import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Star } from "lucide-react";
import api from "../../api";
import { Spinner, EmptyState, PageHeader, ProgressBar } from "../../components/ui.jsx";

function colorForPct(pct) {
  if (pct < 60) return "bg-rose-500";
  if (pct < 80) return "bg-amber-500";
  return "bg-emerald-500";
}

function SimpleBar({ label, value, displayValue, max, color }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  const barColor = color || colorForPct(pct);
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">{displayValue ?? value}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="w-10 shrink-0 text-right text-xs font-semibold text-slate-600">{pct}%</span>
      </div>
    </div>
  );
}

export default function AdminEvaluations() {
  const [evaluations, setEvaluations] = useState(null);

  useEffect(() => {
    api.get("/evaluations").then((res) => setEvaluations(res.data));
  }, []);

  const bySchool = useMemo(() => {
    if (!evaluations) return [];
    const groups = {};
    evaluations.forEach((e) => {
      const key = e.company_name || "Unassigned School";
      if (!groups[key]) groups[key] = { total: 0, count: 0, name: key };
      groups[key].total += e.overall_rating || 0;
      groups[key].count += 1;
    });
    return Object.values(groups)
      .map((g) => ({ ...g, avg: Math.round(g.total / g.count) }))
      .sort((a, b) => b.avg - a.avg);
  }, [evaluations]);

  if (evaluations === null) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Evaluations Overview" subtitle="Performance ratings across all OJT students and schools." />

      {evaluations.length === 0 ? (
        <div className="card"><EmptyState icon={ClipboardList} title="No evaluations yet" hint="Evaluations submitted by supervisors will appear here." /></div>
      ) : (
        <>
          <div className="card p-5">
            <h3 className="mb-4 font-semibold text-slate-800">Performance by School</h3>
            {bySchool.length === 0 ? (
              <p className="text-sm text-slate-500">No overall ratings available.</p>
            ) : (
              <div className="space-y-3">
                {bySchool.slice(0, 12).map((g) => (
                  <SimpleBar
                    key={g.name}
                    label={g.name}
                    value={g.avg}
                    displayValue={`${g.avg}%`}
                    max={100}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4">
            {evaluations.slice(0, 20).map((e) => (
              <div key={e.id} className="card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">{e.intern_name}</h3>
                    <p className="text-xs text-slate-400">{e.course || "No course"}</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
                    <Star size={14} /> {e.overall_rating}%
                  </div>
                </div>
                <ProgressBar value={e.overall_rating} showLabel={false} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
