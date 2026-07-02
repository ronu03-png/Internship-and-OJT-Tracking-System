import { Clock } from "lucide-react";
import { ProgressBar } from "./ui.jsx";

/**
 * OJTProgress — reusable internship hours progress card.
 *
 * Props:
 *   completed  - hours completed so far (default sample: 320)
 *   required   - required hours (default sample: 486)
 *   title      - card title (default: "OJT Progress")
 *   subtitle   - card subtitle (default: "Hours completed toward requirement")
 *
 * Replace the default sample values with live data from your API when ready.
 */
export default function OJTProgress({
  completed = 320,
  required = 486,
  title = "OJT Progress",
  subtitle = "Hours completed toward requirement",
}) {
  const pct = required > 0 ? Math.min(100, Math.round((completed / required) * 100)) : 0;
  const remaining = Math.max(0, required - completed);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-start justify-between gap-4 p-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Clock size={20} />
        </div>
      </div>
      <div className="px-5 pb-5">
        <div className="mb-4 flex flex-wrap items-end gap-2">
          <span className="text-3xl font-extrabold text-slate-900">{completed}</span>
          <span className="mb-1 text-sm font-medium text-slate-500">/ {required} hours</span>
          <span className="mb-1 ml-auto text-sm font-bold text-brand-600">{pct}%</span>
        </div>
        <ProgressBar value={pct} showLabel={false} size="md" />
        <p className="mt-3 text-xs text-slate-500">
          {remaining > 0 ? (
            <>
              <span className="font-semibold text-slate-700">{remaining}</span> hours remaining to complete the OJT requirement.
            </>
          ) : (
            <span className="font-semibold text-emerald-600">Requirement completed!</span>
          )}
        </p>
      </div>
    </div>
  );
}
