"use client";

import { useState, useTransition } from "react";
import { deleteFaq, moveFaqItem, updateFaq } from "@/lib/actions/faq";

interface FaqRowProps {
  id: string;
  question: string;
  answer: string;
  position: number;
  total: number;
}

export default function FaqRow({
  id,
  question,
  answer,
  position,
  total,
}: FaqRowProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [draftQuestion, setDraftQuestion] = useState(question);
  const [draftAnswer, setDraftAnswer] = useState(answer);
  const [error, setError] = useState<string | null>(null);

  const isFirst = position === 0;
  const isLast = position === total - 1;

  const run = (action: () => Promise<{ success: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error ?? "Terjadi kesalahan");
      }
    });
  };

  const save = () => {
    run(async () => {
      const result = await updateFaq(id, draftQuestion, draftAnswer);
      if (result.success) {
        setIsEditing(false);
      }
      return result;
    });
  };

  const cancelEdit = () => {
    setDraftQuestion(question);
    setDraftAnswer(answer);
    setIsEditing(false);
    setError(null);
  };

  const remove = () => {
    if (!confirm(`Hapus FAQ "${question}"?`)) return;
    run(() => deleteFaq(id));
  };

  return (
    <div className="flex flex-col gap-2 rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-4 dark:border-[var(--hard-border)] dark:bg-surface-2">
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 flex-col items-center gap-0.5 pt-0.5">
          <button
            onClick={() => run(() => moveFaqItem(id, "up"))}
            disabled={isPending || isFirst}
            aria-label="Naikkan urutan"
            className="rounded border-[3px] border-[var(--hard-border)] px-1.5 text-xs text-muted transition-colors hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-30 dark:border-[var(--hard-border)] dark:text-foreground dark:hover:bg-surface-3"
          >
            ▲
          </button>
          <span className="text-xs tabular-nums text-muted">
            {position + 1}
          </span>
          <button
            onClick={() => run(() => moveFaqItem(id, "down"))}
            disabled={isPending || isLast}
            aria-label="Turunkan urutan"
            className="rounded border-[3px] border-[var(--hard-border)] px-1.5 text-xs text-muted transition-colors hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-30 dark:border-[var(--hard-border)] dark:text-foreground dark:hover:bg-surface-3"
          >
            ▼
          </button>
        </div>

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <input
                value={draftQuestion}
                onChange={(event) => setDraftQuestion(event.target.value)}
                disabled={isPending}
                minLength={5}
                maxLength={300}
                autoFocus
                className="block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3 py-2 text-sm font-medium text-foreground focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-[var(--hard-border)] dark:bg-surface-3 dark:text-foreground"
              />
              <textarea
                value={draftAnswer}
                onChange={(event) => setDraftAnswer(event.target.value)}
                disabled={isPending}
                rows={4}
                minLength={5}
                maxLength={5000}
                className="block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-[var(--hard-border)] dark:bg-surface-3 dark:text-foreground"
              />
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-foreground">
                {question}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-muted">
                {answer}
              </p>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={save}
                disabled={isPending}
                className="rounded-btn bg-accent-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "..." : "Simpan"}
              </button>
              <button
                onClick={cancelEdit}
                disabled={isPending}
                className="rounded-btn border-[3px] border-[var(--hard-border)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[var(--hard-border)] dark:text-foreground dark:hover:bg-surface-3"
              >
                Batal
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              disabled={isPending}
              className="rounded-btn border-[3px] border-[var(--hard-border)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[var(--hard-border)] dark:text-foreground dark:hover:bg-surface-3"
            >
              Ubah
            </button>
          )}

          <button
            onClick={remove}
            disabled={isPending}
            className="rounded-btn border border-accent-500 px-3 py-1.5 text-xs font-medium text-accent-600 transition-colors hover:bg-accent-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-accent-700 dark:text-accent-500 dark:hover:bg-accent-950"
          >
            {isPending ? "..." : "Hapus"}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-accent-600 dark:text-accent-400">{error}</p>
      )}
    </div>
  );
}
