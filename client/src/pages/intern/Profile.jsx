import { useEffect, useState } from "react";
import { Mail, Phone, Building2, User, GraduationCap, Clock, CalendarClock, MessagesSquare } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../context/AuthContext.jsx";
import { Spinner, Avatar, Badge, ProgressBar } from "../../components/ui.jsx";

export default function InternProfile() {
  const { user } = useAuth();
  const [details, setDetails] = useState(null);
  const [attendance, setAttendance] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    api.get(`/students/${user.id}`).then((res) => setDetails(res.data)).catch(() => setDetails(user));
    api.get("/attendance").then((res) => {
      const records = res.data.filter((r) => r.student_id === Number(user.id) || r.intern_id === Number(user.id));
      setAttendance(records.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at)));
    }).catch(() => setAttendance([]));
  }, [user]);

  if (!user) return <div className="grid min-h-[60vh] place-items-center"><Spinner /></div>;

  const student = details || user;
  const progress = student.required_hours
    ? Math.min(Math.round((student.approved_hours / student.required_hours) * 100), 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />
        <div className="px-6 pb-6">
          <div className="-mt-14 mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            <div className="rounded-full bg-white p-1 shadow-lg">
              <Avatar name={student.full_name} size="xl" />
            </div>
            <div className="mb-1 flex-1">
              <h1 className="text-2xl font-bold text-slate-800">{student.full_name}</h1>
              <p className="text-sm text-slate-500">{student.course || "No course assigned"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/messages" className="btn-ghost flex items-center gap-1.5"><MessagesSquare size={16} /> Messages</Link>
              <Badge status={student.status || "active"} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: GraduationCap, label: "Student ID", value: student.student_id || student.id },
              { icon: Mail, label: "Email", value: student.email },
              { icon: Phone, label: "Phone", value: student.phone },
              { icon: Building2, label: "School / Office", value: student.company_name },
              { icon: User, label: "Supervisor", value: student.supervisor_name },
              { icon: GraduationCap, label: "Department / Course", value: student.course },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-white text-slate-500 shadow-sm">
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-800">{item.value || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <Clock size={18} />
            </div>
            <h2 className="font-semibold text-slate-800">OJT Progress</h2>
          </div>
          <p className="mb-2 text-sm text-slate-600">
            <span className="text-2xl font-bold text-slate-800">{student.approved_hours || 0}</span>
            <span className="text-slate-400"> / {student.required_hours || 486} hours approved</span>
          </p>
          <ProgressBar value={progress} size="md" />
          <p className="mt-2 text-sm font-medium text-slate-600">{progress}% complete</p>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <CalendarClock size={18} />
            </div>
            <h2 className="font-semibold text-slate-800">My Attendance</h2>
          </div>
          {attendance === null ? (
            <Spinner />
          ) : attendance.length === 0 ? (
            <p className="text-sm text-slate-500">No attendance records yet.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">In</th>
                    <th className="px-4 py-3">Out</th>
                    <th className="px-4 py-3">Hours</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendance.slice(0, 10).map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3">{r.date}</td>
                      <td className="px-4 py-3">{r.time_in || "—"}</td>
                      <td className="px-4 py-3">{r.time_out || "—"}</td>
                      <td className="px-4 py-3 font-semibold">{r.hours}</td>
                      <td className="px-4 py-3"><Badge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
