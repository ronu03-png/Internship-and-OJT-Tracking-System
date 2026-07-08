import { useEffect, useState } from "react";
import { Plus, Shield, Users, Building2, GraduationCap, Trash2, Pencil } from "lucide-react";
import api from "../../api";
import { Badge, Modal, Spinner, EmptyState, PageHeader, Avatar } from "../../components/ui.jsx";

const roleBadge = {
  admin: "bg-rose-100 text-rose-700 ring-rose-200",
  supervisor: "bg-amber-100 text-amber-700 ring-amber-200",
  intern: "bg-emerald-100 text-emerald-700 ring-emerald-200",
};

const blank = { full_name: "", email: "", password: "", role: "intern", department: "", course: "", company_name: "", position: "", student_id: "", required_hours: "486", supervisor_id: "", phone: "", status: "active" };

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/auth/users").then((res) => setUsers(res.data));
  useEffect(() => { load(); api.get("/auth/supervisors").then((res) => setSupervisors(res.data)); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setForm(blank);
    setOpen(true);
  };

  const openEdit = async (id) => {
    const user = await api.get(`/admin/users/${id}`).then((res) => res.data).catch(() => null);
    if (!user) return;
    setMode("edit");
    setEditingId(id);
    setForm({
      full_name: user.full_name || "",
      email: user.email || "",
      password: "",
      role: user.role || "intern",
      department: user.department || "",
      course: user.course || "",
      company_name: user.company_name || "",
      position: user.position || "",
      student_id: user.student_id || "",
      required_hours: String(user.required_hours || 486),
      supervisor_id: user.supervisor_id || "",
      phone: user.phone || "",
      status: user.status || "active",
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setForm(blank);
    setEditingId(null);
    setMode("create");
  };

  const submit = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.role === "intern") {
        payload.required_hours = Number(payload.required_hours) || 486;
        payload.supervisor_id = payload.supervisor_id ? Number(payload.supervisor_id) : null;
        payload.student_id = payload.student_id || null;
      } else {
        payload.supervisor_id = null;
        payload.student_id = null;
        payload.required_hours = 0;
      }
      if (mode === "create") {
        await api.post("/auth/register", payload);
      } else {
        await api.put(`/admin/users/${editingId}`, payload);
      }
      close();
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Could not save user");
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
      <PageHeader title="User Management" subtitle="Create and manage administrators, supervisors, and students.">
        <button className="btn-primary" onClick={openCreate}>
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
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(u.id)} className="text-slate-400 hover:text-blue-600" title="Edit">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => deactivate(u.id)} className="text-slate-400 hover:text-rose-600" title="Deactivate">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        onClose={close}
        title={mode === "create" ? "Add user" : "Edit user"}
        footer={
          <>
            <button className="btn-ghost" onClick={close}>Cancel</button>
            <button className="btn-primary" onClick={submit} disabled={saving || !form.full_name || !form.email || !form.role || (mode === "create" && !form.password)}>
              {saving ? "Saving..." : (mode === "create" ? "Create" : "Save")}
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
            <label className="label">Password {mode === "edit" && <span className="text-xs text-slate-400">(leave blank to keep)</span>}</label>
            <input className="input" type="password" value={form.password} onChange={set("password")} />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={set("role")}>
              <option value="intern">Student</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={set("status")}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={set("phone")} placeholder="Optional" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Department</label>
            <input className="input" value={form.department} onChange={set("department")} placeholder="Optional" />
          </div>
          <div>
            <label className="label">{form.role === "intern" ? "Course" : "School / Office"}</label>
            <input className="input" value={form.role === "intern" ? form.course : form.company_name} onChange={form.role === "intern" ? set("course") : set("company_name")} placeholder="Optional" />
          </div>
        </div>
        {form.role === "intern" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Student ID</label>
                <input className="input" value={form.student_id} onChange={set("student_id")} placeholder="e.g. 2024-001" />
              </div>
              <div>
                <label className="label">Course</label>
                <input className="input" value={form.course} onChange={set("course")} placeholder="e.g. BS Information Technology" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Required hours</label>
                <input className="input" type="number" value={form.required_hours} onChange={set("required_hours")} />
              </div>
              <div>
                <label className="label">Supervisor</label>
                <select className="input" value={form.supervisor_id} onChange={set("supervisor_id")}>
                  <option value="">Select supervisor</option>
                  {supervisors.map((s) => <option key={s.id} value={s.id}>{s.full_name} {s.company_name ? `· ${s.company_name}` : ""}</option>)}
                </select>
              </div>
            </div>
          </>
        )}
        {form.role === "supervisor" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">School / Office</label>
              <input className="input" value={form.company_name} onChange={set("company_name")} placeholder="School or company name" />
            </div>
            <div>
              <label className="label">Position</label>
              <input className="input" value={form.position} onChange={set("position")} placeholder="e.g. HR Supervisor" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
