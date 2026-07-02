import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import api from "../api";
import { Spinner, EmptyState, PageHeader, Badge } from "../components/ui.jsx";

export default function Notifications() {
  const [items, setItems] = useState(null);

  const load = () => api.get("/notifications").then((res) => setItems(res.data));
  useEffect(() => { load(); }, []);

  const notifyUpdate = () => window.dispatchEvent(new Event("notifications-updated"));

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    load();
    notifyUpdate();
  };

  const markAllRead = async () => {
    await api.patch("/notifications/read-all");
    load();
    notifyUpdate();
  };

  if (items === null) return <Spinner />;
  const unread = items.filter((n) => !n.read_at).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" subtitle={`${unread} unread of ${items.length} total`}>
        <button onClick={markAllRead} className="btn-ghost" disabled={unread === 0}><Check size={16} /> Mark all read</button>
      </PageHeader>

      {items.length === 0 ? (
        <div className="card"><EmptyState icon={Bell} title="No notifications" hint="You are all caught up." /></div>
      ) : (
        <div className="card divide-y divide-slate-100 overflow-hidden">
          {items.map((n) => (
            <div key={n.id} className={`flex items-start gap-4 p-4 transition hover:bg-slate-50 ${n.read_at ? "opacity-70" : "bg-brand-50/30"}`}>
              <div className={`mt-0.5 h-2.5 w-2.5 rounded-full ${n.read_at ? "bg-slate-300" : "bg-brand-500"}`} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800">{n.title}</p>
                <p className="text-sm text-slate-500">{n.message}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.read_at && <button onClick={() => markRead(n.id)} className="text-xs font-semibold text-brand-600 hover:underline">Mark read</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
