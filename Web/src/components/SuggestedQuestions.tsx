const QUESTIONS = ["What does this code mean?", "What could cause it?", "What should I check?", "How serious is it?"];

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  disabled: boolean;
}

export function SuggestedQuestions({ onSelect, disabled }: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
      {QUESTIONS.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => onSelect(question)}
          disabled={disabled}
          className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:border-zinc-500 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
