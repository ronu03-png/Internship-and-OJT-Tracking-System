import { useEffect, useMemo, useState } from "react";
import { Plus, Building2, Search, ExternalLink, Users, MapPin, ChevronLeft, ChevronRight, Download } from "lucide-react";
import api from "../../api";
import { Modal, Spinner, EmptyState, PageHeader, StatCard, Badge } from "../../components/ui.jsx";

const blank = { name: "", address: "", industry: "", email: "", phone: "", website: "", department: "", description: "", available_slots: 1 };
const PAGE_SIZE = 9;

export default function SupervisorCompanies() {
  const [companies, setCompanies] = useState(null);
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/companies").then((res) => setCompanies(res.data));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setSaving(true);
    try {
      await api.post("/companies", form);
      setOpen(false);
      setForm(blank);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Could not save company");
    } finally {
      setSaving(false);
    }
  };

  const industries = useMemo(() => [...new Set((companies || []).map((c) => c.industry).filter(Boolean))], [companies]);
  const filtered = useMemo(() => (companies || []).filter((c) => {
    const q = search.toLowerCase();
    return (c.name.toLowerCase().includes(q) || (c.industry || "").toLowerCase().includes(q) || (c.department || "").toLowerCase().includes(q)) &&
      (!industryFilter || c.industry === industryFilter);
  }), [companies, search, industryFilter]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalSlots = useMemo(() => (companies || []).reduce((a, c) => a + (c.available_slots || 0), 0), [companies]);
  const activeCount = useMemo(() => (companies || []).filter((c) => c.status === "active").length, [companies]);

  const exportCSV = () => {
    const rows = filtered.map((c) => [c.name, c.industry, c.address, c.email, c.phone, c.available_slots].join(","));
    const csv = ["Name,Industry,Address,Email,Phone,Slots", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "companies.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Company Management" subtitle={`${filtered.length} partner companies and city offices`}>
        <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> Add company</button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Building2} tone="brand" label="Total Companies" value={companies?.length || 0} />
        <StatCard icon={Building2} tone="emerald" label="Active" value={activeCount} />
        <StatCard icon={Users} tone="amber" label="Available Slots" value={totalSlots} sub="total openings" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input pl-9" placeholder="Search companies..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
        <select className="input" value={industryFilter} onChange={(e) => { setIndustryFilter(e.target.value); setPage(1); }}>
          <option value="">All industries</option>
          {industries.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <button onClick={exportCSV} className="btn-ghost"><Download size={16} /> Export</button>
      </div>

      {companies === null ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={Building2} title="No companies found" hint="Add the first company or city office." /></div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((c) => (
              <div key={c.id} className="card p-5 transition hover:shadow-glow">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-800">{c.name}</h3>
                  <Badge status={c.status} />
                </div>
                <p className="mb-2 text-xs text-slate-400">{c.industry || "No industry"} · {c.department || "No department"}</p>
                {c.description && <p className="mb-3 line-clamp-2 text-sm text-slate-600">{c.description}</p>}
                <div className="space-y-1 text-sm text-slate-500">
                  {c.email && <p>{c.email}</p>}
                  {c.phone && <p>{c.phone}</p>}
                  {c.address && <p className="flex items-center gap-1"><MapPin size={12} /> {c.address}</p>}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Slots: {c.available_slots}</span>
                  {c.website && (
                    <a href={c.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"><ExternalLink size={12} /> Website</a>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">Showing {paged.length} of {filtered.length} companies</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
              <span className="text-xs font-medium text-slate-600">Page {page} of {pageCount}</span>
              <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page >= pageCount} className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          </div>
        </>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add company"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={submit} disabled={saving || !form.name}>
              {saving ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        <div>
          <label className="label">Company name</label>
          <input className="input" value={form.name} onChange={set("name")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Industry</label><input className="input" value={form.industry} onChange={set("industry")} /></div>
          <div><label className="label">Department focus</label><input className="input" value={form.department} onChange={set("department")} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={set("email")} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={set("phone")} /></div>
        </div>
        <div>
          <label className="label">Address</label>
          <input className="input" value={form.address} onChange={set("address")} />
        </div>
        <div>
          <label className="label">Website</label>
          <input className="input" value={form.website} onChange={set("website")} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[80px]" value={form.description} onChange={set("description")} />
        </div>
        <div>
          <label className="label">Available slots</label>
          <input className="input" type="number" min={0} value={form.available_slots} onChange={set("available_slots")} />
        </div>
      </Modal>
    </div>
  );
}
