import { Mail, Phone, Building2, User, Shield, MessagesSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Spinner, Avatar, Badge } from "../../components/ui.jsx";

export default function SupervisorProfile() {
  const { user } = useAuth();

  if (!user) return <div className="grid min-h-[60vh] place-items-center"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />
        <div className="px-6 pb-6">
          <div className="-mt-14 mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            <div className="rounded-full bg-white p-1 shadow-lg">
              <Avatar name={user.full_name} size="xl" />
            </div>
            <div className="mb-1 flex-1">
              <h1 className="text-2xl font-bold text-slate-800">{user.full_name}</h1>
              <p className="text-sm text-slate-500 capitalize">{user.role} · {user.company_name || "Supervisor"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/messages" className="btn-ghost flex items-center gap-1.5"><MessagesSquare size={16} /> Messages</Link>
              <Badge status={user.status || "active"} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: User, label: "Full name", value: user.full_name },
              { icon: Mail, label: "Email", value: user.email },
              { icon: Phone, label: "Phone", value: user.phone },
              { icon: Building2, label: "School / Office", value: user.company_name },
              { icon: Shield, label: "Role", value: user.role },
              { icon: User, label: "Department", value: user.department },
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
    </div>
  );
}
