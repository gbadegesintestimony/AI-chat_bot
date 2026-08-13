interface CurrentFaultBadgeProps {
  faultCode: string;
  known: boolean;
  onReset: () => void;
}

export function CurrentFaultBadge({ faultCode, known, onReset }: CurrentFaultBadgeProps) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-50">{faultCode}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            known
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
          }`}
        >
          {known ? "In reference database" : "Not in reference database"}
        </span>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        New fault code
      </button>
    </div>
  );
}
