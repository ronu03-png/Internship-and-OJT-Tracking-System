import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Users, GraduationCap, Search, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../api";
import { Spinner, EmptyState, PageHeader, Avatar, ProgressBar, Badge } from "../../components/ui.jsx";
import { exportToExcel } from "../../utils/exportExcel.js";

const PAGE_SIZE = 10;

export default function SupervisorStudents() {
  const [students, setStudents] = useState(null);
  const [search, setSearch] = useState("");
  const [letterFilter, setLetterFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [supervisorFilter, setSupervisorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get("/students").then((res) => setStudents(res.data));
  }, []);

  const courses = useMemo(() => [...new Set((students || []).map((s) => s.course).filter(Boolean))], [students]);

  const supervisors = useMemo(() => [...new Map((students || []).filter((s) => s.supervisor_name).map((s) => [s.supervisor_name, s.supervisor_name])).values()], [students]);

  const filtered = useMemo(() => (students || []).filter((s) => {
    const q = search.toLowerCase();
    const name = s.full_name.toLowerCase();
    const letter = letterFilter.toLowerCase();
    return (
      (name.includes(q) || s.email.toLowerCase().includes(q) || (s.student_id || "").toLowerCase().includes(q)) &&
      (!letter || name.startsWith(letter)) &&
      (!courseFilter || s.course === courseFilter) &&
      (!supervisorFilter || s.supervisor_name === supervisorFilter) &&
      (!statusFilter || s.status === statusFilter)
    );
  }), [students, search, letterFilter, courseFilter, supervisorFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportStudents = () => {
    exportToExcel({
      data: filtered,
      headers: [
        { key: "student_id", label: "Student ID" },
        { key: "full_name", label: "Name" },
        { key: "course", label: "Course" },
        { key: "email", label: "Email" },
        { key: "company_name", label: "School" },
        { key: "supervisor_name", label: "Supervisor" },
        { key: "status", label: "Status" },
        { key: "hours", label: "Hours", value: (s) => `${s.approved_hours}/${s.required_hours}` },
      ],
      filename: "students",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Student Management" subtitle={`${filtered.length} registered students`}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input h-10 w-full pl-9 text-sm" placeholder="Search students..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
          <input
            className="input h-10 w-full text-center text-sm uppercase"
            maxLength={1}
            placeholder="A–Z"
            value={letterFilter}
            onChange={(e) => { setLetterFilter(e.target.value.replace(/[^a-zA-Z]/g, "")); setPage(1); }}
          />
          <select className="input h-10 w-full text-sm" value={courseFilter} onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}>
            <option value="">All courses</option>
            {courses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input h-10 w-full text-sm" value={supervisorFilter} onChange={(e) => { setSupervisorFilter(e.target.value); setPage(1); }}>
            <option value="">All supervisors</option>
            {supervisors.map((sup) => <option key={sup} value={sup}>{sup}</option>)}
          </select>
          <select className="input h-10 w-full text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="inactive">Inactive</option>
          </select>
          <button onClick={exportStudents} className="btn-ghost flex h-10 items-center justify-center gap-1.5 text-sm"><Download size={16} /> Export</button>
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
                <th className="px-4 py-3">School</th>
                <th className="px-4 py-3">Supervisor</th>
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
                      <div>
                        <Link to={`/students/${s.id}`} className="font-semibold text-slate-800 hover:text-blue-600 hover:underline">
                          {s.full_name}
                        </Link>
                        <p className="text-xs text-slate-400">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-600">{s.student_id || s.id}</td>
                  <td className="px-4 py-3 text-slate-600">{s.course || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{s.company_name || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{s.supervisor_name || "—"}</td>
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
