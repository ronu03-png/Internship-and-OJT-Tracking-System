import { useEffect, useMemo, useState } from "react";
import { Users, GraduationCap, Search, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../api";
import { Spinner, EmptyState, PageHeader, Avatar, ProgressBar, Badge } from "../../components/ui.jsx";

const PAGE_SIZE = 10;

export default function CoordinatorStudents() {
  const [students, setStudents] = useState(null);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get("/students").then((res) => setStudents(res.data));
  }, []);

  const courses = useMemo(() => [...new Set((students || []).map((s) => s.course).filter(Boolean))], [students]);

  const filtered = useMemo(() => (students || []).filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.full_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.student_id || "").toLowerCase().includes(q)) &&
      (!courseFilter || s.course === courseFilter) &&
      (!statusFilter || s.status === statusFilter)
    );
  }), [students, search, courseFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCSV = () => {
    const rows = filtered.map((s) => [s.student_id || s.id, s.full_name, s.course, s.email, s.status, `${s.approved_hours}/${s.required_hours}`].join(","));
    const csv = ["Student ID,Name,Course,Email,Status,Hours", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "students.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Student Management" subtitle={`${filtered.length} registered students`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input pl-9" placeholder="Search students..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
          <select className="input" value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}>
            <option value="">All courses</option>
            {courses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <button onClick={exportCSV} className="btn-ghost"><Download size={16} /> Export</button>
        </div>
      </PageHeader>

      {students === null ? <Spinner /> : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={Users} title="No students found" hint="Try adjusting your search or filters." /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Hours</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paged.map((s) => (
                <tr key={s.id} className="transition hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.full_name} size="sm" />
                      <div><p className="font-semibold text-slate-800">{s.full_name}</p><p className="text-xs text-slate-400">{s.email}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-600">{s.student_id || s.id}</td>
                  <td className="px-4 py-3 text-slate-600">{s.course || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{s.company_name || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{s.approved_hours}/{s.required_hours}</td>
                  <td className="px-4 py-3"><ProgressBar value={s.progress} size="md" /></td>
                  <td className="px-4 py-3"><Badge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-500">Showing {paged.length} of {filtered.length} students</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
              <span className="text-xs font-medium text-slate-600">Page {page} of {pageCount}</span>
              <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page >= pageCount} className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
