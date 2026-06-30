import { useEffect, useState } from "react";
import { Plus, Shield, Users, Building2, GraduationCap, Trash2, Pencil } from "lucide-react";
import api from "../../api";
import { Badge, Modal, Spinner, EmptyState, PageHeader, Avatar } from "../../components/ui.jsx";

const roleBadge = {
  admin: "bg-rose-100 text-rose-700 ring-rose-200",
  coordinator: "bg-sky-100 text-sky-700 ring-sky-200",
  supervisor: "bg-amber-100 text-amber-700 ring-amber-200",
  intern: "bg-emerald-100 text-emerald-700 ring-emerald-200",
};

const blank = { full_name: "", email: "", password: "", role: "intern", department: "", course: "", company_name: "" };

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/auth/users").then((res) => setUsers(res.data));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setSaving(true);
    try {
      await api.post("/auth/register", form);
      setOpen(false);
      setForm(blank);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Could not create user");
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (id) => {
    if (!confirm("Deactivate this user?")) return;
    await api.patch(`/admin/users/${id}/status`, { status: "inactive" });
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" subtitle="Create and manage administrators, coordinators, supervisors, and students.">
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={16} /> Add user
        </button>
      </PageHeader>

      {users === null ? (
        <Spinner />
      ) : users.length === 0 ? (
        <div className="card"><EmptyState icon={Users} title="No users yet" hint="Create the first user with the button above." /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Course / Company</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="transition hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.full_name} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-800">{u.full_name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${roleBadge[u.role] || "bg-slate-100 text-slate-600 ring-slate-200"}`}>
                      {u.role === "admin" && <Shield size={12} />}
                      {u.role === "supervisor" && <Building2 size={12} />}
                      {u.role === "intern" && <GraduationCap size={12} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{u.department || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{u.course || u.company_name || "—"}</td>
                  <td className="px-4 py-3"><Badge status={u.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deactivate(u.id)} className="text-slate-400 hover:text-rose-600" title="Deactivate">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add user"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={submit} disabled={saving || !form.full_name || !form.email || !form.password || !form.role}>
              {saving ? "Creating..." : "Create"}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.full_name} onChange={set("full_name")} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={set("email")} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={form.password} onChange={set("password")} />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={set("role")}>
              <option value="intern">Student</option>
              <option value="supervisor">Supervisor</option>
              <option value="coordinator">Coordinator</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Department</label>
            <input className="input" value={form.department} onChange={set("department")} placeholder="Optional" />
          </div>
          <div>
            <label className="label">{form.role === "intern" ? "Course" : "Company / Position"}</label>
            <input className="input" value={form.course || form.company_name} onChange={form.role === "intern" ? set("course") : set("company_name")} placeholder="Optional" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
