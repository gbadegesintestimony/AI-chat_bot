import type { FaultCodeSummary } from "@/lib/types";

interface CurrentFaultBadgeProps {
  codes: FaultCodeSummary[];
  onReset: () => void;
}

export function CurrentFaultBadge({ codes, onReset }: CurrentFaultBadgeProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <div className="flex flex-wrap items-center gap-1.5">
        {codes.map(({ code, known }) => (
          <span
            key={code}
            title={known ? "In reference database" : "Not in reference database — general knowledge only"}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs font-semibold ${
              known
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${known ? "bg-emerald-500" : "bg-amber-500"}`} />
            {code}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={onReset}
        className="shrink-0 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        New fault code
      </button>
    </div>
  );
}
