import { useEffect, useState } from "react";
import { Settings, Save } from "lucide-react";
import api from "../../api";
import { Spinner, PageHeader } from "../../components/ui.jsx";

export default function AdminSettings() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/settings").then((res) => {
      setForm({
        school_name: "",
        academic_year: "",
        semester: "",
        required_hours: "",
        theme: "light",
        ...res.data,
      });
    });
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/settings", form);
      alert("Settings saved");
    } catch (err) {
      alert(err.response?.data?.error || "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="System Settings" subtitle="Configure school information and global defaults." />
      <div className="card max-w-2xl p-6 space-y-4">
        <div>
          <label className="label">School name</label>
          <input className="input" value={form.school_name} onChange={set("school_name")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Academic year</label><input className="input" value={form.academic_year} onChange={set("academic_year")} placeholder="2025-2026" /></div>
          <div><label className="label">Semester</label><input className="input" value={form.semester} onChange={set("semester")} placeholder="2nd Semester" /></div>
        </div>
        <div>
          <label className="label">Required hours</label>
          <input className="input" type="number" value={form.required_hours} onChange={set("required_hours")} />
        </div>
        <div>
          <label className="label">Theme</label>
          <select className="input" value={form.theme} onChange={set("theme")}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <button className="btn-primary mt-2" onClick={save} disabled={saving}>
          <Save size={16} /> {saving ? "Saving..." : "Save settings"}
        </button>
      </div>
    </div>
  );
}
