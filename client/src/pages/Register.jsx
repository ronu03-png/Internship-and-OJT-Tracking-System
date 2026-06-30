import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, AlertCircle, UserRound, Building2 } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import AuthShell from "../components/AuthShell.jsx";
import { APP_NAME, DEPARTMENTS, coursesForDepartment } from "../constants.js";

export default function Register() {
  const { register } = useAuth();
  const [role, setRole] = useState("intern");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    company_name: "",
    position: "",
    department: "",
    course: "",
    required_hours: 486,
    supervisor_id: "",
  });
  const [supervisors, setSupervisors] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/auth/supervisors").then((res) => setSupervisors(res.data)).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setDepartment = (e) => setForm({ ...form, department: e.target.value, course: "" });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ ...form, role });
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-6 flex flex-col items-center text-center lg:hidden">
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
          <GraduationCap size={26} />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900">{APP_NAME}</h1>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Join as an intern or a company supervisor.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {error && (
          <p className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-600 ring-1 ring-inset ring-rose-100">
            <AlertCircle size={16} /> {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("intern")}
            className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition ${role === "intern" ? "border-brand-500 bg-brand-50 text-brand-700 shadow-soft" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
          >
            <UserRound size={20} />
            I'm a Student
          </button>
          <button
            type="button"
            onClick={() => setRole("supervisor")}
            className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition ${role === "supervisor" ? "border-brand-500 bg-brand-50 text-brand-700 shadow-soft" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
          >
            <Building2 size={20} />
            I'm a Supervisor
          </button>
        </div>

        <div>
            <label className="label">Full name</label>
            <input className="input" value={form.full_name} onChange={set("full_name")} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={set("email")} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={form.password} onChange={set("password")} required minLength={4} />
          </div>

          {role === "supervisor" ? (
            <>
              <div>
                <label className="label">Company name</label>
                <input className="input" value={form.company_name} onChange={set("company_name")} required />
              </div>
              <div>
                <label className="label">Industry / Department focus (optional)</label>
                <select className="input" value={form.department} onChange={set("department")}>
                  <option value="">Any / Not specified</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Department</label>
                  <select className="input" value={form.department} onChange={setDepartment} required>
                    <option value="">Select department...</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Course / Program</label>
                  <select className="input" value={form.course} onChange={set("course")} required disabled={!form.department}>
                    <option value="">Select course...</option>
                    {coursesForDepartment(form.department).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Position / Role (optional)</label>
                <input className="input" value={form.position} onChange={set("position")} placeholder="e.g. Software Dev Intern" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Required hours</label>
                  <input className="input" type="number" value={form.required_hours} onChange={set("required_hours")} min={0} />
                </div>
                <div>
                  <label className="label">Supervisor (optional)</label>
                  <select className="input" value={form.supervisor_id} onChange={set("supervisor_id")}>
                    <option value="">Select later...</option>
                    {supervisors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.company_name} — {s.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {supervisors.length === 0 && (
                <p className="text-xs text-amber-600">No companies yet. You can still register and browse openings once companies post them.</p>
              )}
            </>
          )}

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
