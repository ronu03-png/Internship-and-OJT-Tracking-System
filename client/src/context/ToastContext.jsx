import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration + 300);
  }, []);

  const success = useCallback((message) => addToast(message, "success"), [addToast]);
  const error = useCallback((message) => addToast(message, "error"), [addToast]);
  const info = useCallback((message) => addToast(message, "info"), [addToast]);
  const warning = useCallback((message) => addToast(message, "warning"), [addToast]);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const ICONS = {
    success: { icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
    error: { icon: XCircle, color: "bg-rose-50 text-rose-600 ring-rose-100" },
    info: { icon: Info, color: "bg-blue-50 text-blue-600 ring-blue-100" },
    warning: { icon: AlertCircle, color: "bg-amber-50 text-amber-600 ring-amber-100" },
  };

  return (
    <ToastContext.Provider value={{ success, error, info, warning, addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-3 px-4 sm:px-0">
        {toasts.map((t) => {
          const { icon: Icon, color } = ICONS[t.type] || ICONS.info;
          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 rounded-xl p-4 shadow-lg ring-1 ring-inset transition-all duration-300 animate-slide-in-right ${color}`}
            >
              <Icon size={20} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-sm font-medium">{t.message}</p>
              <button onClick={() => remove(t.id)} className="shrink-0 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
