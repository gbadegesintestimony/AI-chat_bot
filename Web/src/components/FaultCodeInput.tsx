"use client";

import { FormEvent, useState } from "react";

interface FaultCodeInputProps {
  onSubmit: (code: string) => void;
  isLoading: boolean;
  error: string | null;
}

const EXAMPLE_CODES = ["P0301", "P0171", "P0420"];

export function FaultCodeInput({ onSubmit, isLoading, error }: FaultCodeInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          GOBD AI Fault-Code Assistant
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Enter a vehicle fault code to get a plain-language explanation and ask follow-up questions.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="e.g. P0301"
            autoFocus
            disabled={isLoading}
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            type="submit"
            disabled={isLoading || !value.trim()}
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isLoading ? "Loading…" : "Explain"}
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>Try:</span>
          {EXAMPLE_CODES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => onSubmit(code)}
              disabled={isLoading}
              className="rounded-full border border-zinc-300 px-3 py-1 font-mono transition-colors hover:border-zinc-500 hover:text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:hover:text-zinc-50"
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
