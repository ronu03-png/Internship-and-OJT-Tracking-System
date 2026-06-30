import { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "../constants.js";

// Whole-site password gate.
// Activates ONLY when VITE_SITE_PASSWORD is set at build time. When unset, the
// app renders normally. This is a lightweight front-door lock meant to hide an
// in-progress demo from the public; it is not a replacement for the per-user
// login that protects actual data.
const SITE_PASSWORD = import.meta.env.VITE_SITE_PASSWORD;
const STORAGE_KEY = "its_site_unlocked";

export default function SiteGate({ children }) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === "1"
  );
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  // No password configured -> gate disabled. Already unlocked -> pass through.
  if (!SITE_PASSWORD || unlocked) return children;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value === SITE_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
    } else {
      setError("Incorrect password. Please try again.");
      setValue("");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl animate-scale-in">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg ring-2 ring-white/70">
            <Lock size={28} strokeWidth={2.5} />
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-slate-900">{APP_NAME}</h1>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {APP_TAGLINE}
          </p>
        </div>

        <p className="mb-4 text-center text-sm text-slate-500">
          This site is private. Enter the access password to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            autoFocus
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            placeholder="Access password"
            className="input text-center"
          />
          {error && (
            <p className="text-center text-xs font-medium text-rose-600">{error}</p>
          )}
          <button type="submit" className="btn-primary w-full">
            <ShieldCheck size={18} />
            Unlock Site
          </button>
        </form>
      </div>
    </div>
  );
}
