import { useEffect, useState } from "react";
import { BarChart3, Users, Building2, FileCheck2, CalendarClock, FileText } from "lucide-react";
import api from "../api";
import { Spinner, EmptyState, PageHeader, StatCard } from "../components/ui.jsx";
import { sampleProgressDataset } from "../utils/demoProgress.js";

function colorForPct(pct) {
  if (pct === 0) return "bg-slate-200";
  if (pct < 34) return "bg-brand-300";
  if (pct < 67) return "bg-brand-500";
  return "bg-brand-700";
}

function SimpleBar({ label, value, displayValue, max, color }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  const barColor = color || colorForPct(pct);
  return (
    <div className="mb-2">
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

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    api.get("/stats/admin").then((res) => setStats(res.data));
    api.get("/students").then((res) => setStudents(res.data));
  }, []);

  if (!stats) return <Spinner />;

  const progressStudents = sampleProgressDataset(students, 10);
  const maxHours = Math.max(...progressStudents.map((s) => s.required_hours || 1), 1);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Overview of OJT program performance and activity." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} tone="brand" label="Students" value={stats.student_count} />
        <StatCard icon={Building2} tone="amber" label="Companies" value={stats.company_count} />
        <StatCard icon={FileCheck2} tone="emerald" label="Pending Requirements" value={stats.pending_requirements} />
        <StatCard icon={CalendarClock} tone="sky" label="Pending Attendance" value={stats.pending_attendance} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-slate-800">Student Progress</h3>
          {progressStudents.length === 0 ? (
            <EmptyState icon={Users} title="No students" hint="Student progress will appear here." />
          ) : (
            <div className="space-y-3">
              {progressStudents.map((s) => (
                <SimpleBar
                  key={s.id}
                  label={s.full_name}
                  value={s.approved_hours}
                  displayValue={`${s.approved_hours}/${s.required_hours} hrs`}
                  max={s.required_hours}
                />
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-slate-800">Program Overview</h3>
          <SimpleBar label="Openings / Placements" value={stats.placement_count} max={Math.max(stats.placement_count, 1)} color="bg-brand-500" />
          <SimpleBar label="Announcements" value={stats.announcement_count} max={Math.max(stats.announcement_count, 1)} color="bg-brand-500" />
          <SimpleBar label="Calendar Events" value={stats.event_count} max={Math.max(stats.event_count, 1)} color="bg-brand-500" />
          <SimpleBar label="Audit Logs" value={stats.audit_count} max={Math.max(stats.audit_count, 1)} color="bg-brand-500" />
        </div>
      </div>
    </div>
  );
}
