import { useEffect, useRef, useState } from "react";
import { Send, MessagesSquare } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { Spinner, EmptyState, Avatar, PageHeader } from "../components/ui.jsx";

export default function Messages() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState(null);
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState([]);
  const [body, setBody] = useState("");
  const endRef = useRef(null);

  const loadContacts = () => api.get("/messages/contacts").then((res) => {
    setContacts(res.data);
    setActive((cur) => cur || res.data[0] || null);
  });

  useEffect(() => { loadContacts(); }, []);

  const loadThread = (id) => api.get(`/messages/${id}`).then((res) => setThread(res.data));

  useEffect(() => {
    if (!active) return;
    loadThread(active.id);
    const t = setInterval(() => loadThread(active.id), 5000);
    return () => clearInterval(t);
  }, [active?.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [thread]);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim() || !active) return;
    await api.post("/messages", { recipient_id: active.id, body });
    setBody("");
    loadThread(active.id);
  };

  if (contacts === null) return <Spinner />;

  return (
    <div className="space-y-4">
      <PageHeader title="Messages" subtitle="Chat directly with your supervisor or interns." />
      {contacts.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={MessagesSquare}
            title="No contacts yet"
            hint={user.role === "supervisor" ? "Interns will appear here once they register under you." : "You'll be able to message your supervisor here."}
          />
        </div>
      ) : (
        <div className="card grid h-[72vh] grid-cols-1 overflow-hidden sm:grid-cols-3">
          <div className="hidden border-r border-slate-200 sm:col-span-1 sm:block sm:overflow-y-auto">
            {contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c)}
                className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm transition hover:bg-slate-50 ${active?.id === c.id ? "bg-brand-50" : ""}`}
              >
                <Avatar name={c.full_name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-800">{c.full_name}</p>
                  <p className="truncate text-xs capitalize text-slate-400">{c.company_name || c.position || c.role}</p>
                </div>
                {c.unread > 0 && <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-brand-600 px-1.5 text-xs font-semibold text-white">{c.unread}</span>}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:col-span-2">
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
              {active && <Avatar name={active.full_name} size="sm" />}
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-800">{active?.full_name}</p>
                <p className="truncate text-xs capitalize text-slate-400">{active?.company_name || active?.position || active?.role}</p>
              </div>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-4">
              {thread.length === 0 && <p className="py-10 text-center text-sm text-slate-400">No messages yet. Say hello!</p>}
              {thread.map((m) => {
                const mine = m.sender_id === user.id;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-soft ${mine ? "rounded-br-md bg-brand-gradient text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-700"}`}>
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-slate-400"}`}>{m.created_at?.slice(0, 16).replace("T", " ")}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
            <form onSubmit={send} className="flex gap-2 border-t border-slate-200 bg-white p-3">
              <input className="input flex-1" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type a message..." />
              <button className="btn-primary" disabled={!body.trim()}><Send size={16} /></button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
