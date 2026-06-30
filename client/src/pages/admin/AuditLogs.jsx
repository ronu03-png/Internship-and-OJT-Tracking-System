import { useEffect, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import api from "../../api";
import { Spinner, EmptyState, PageHeader, Avatar } from "../../components/ui.jsx";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/admin/audit").then((res) => setLogs(res.data));
  }, []);

  const filtered = (logs || []).filter((l) =>
    (l.action || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.entity || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.user_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" subtitle="Recent system activity and user actions." />
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9" placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {logs === null ? <Spinner /> : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={BookOpen} title="No audit logs" hint="Activity will be recorded here." /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((l) => (
                <tr key={l.id} className="transition hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={l.user_name || "System"} size="sm" />
                      <span className="font-medium text-slate-700">{l.user_name || "System"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{l.action}</td>
                  <td className="px-4 py-3 text-slate-500">{l.entity || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{l.details || "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{new Date(l.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
