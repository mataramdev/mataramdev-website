"use client";

import { useState, useTransition } from "react";
import { deleteStack, renameStack } from "@/lib/actions/stacks";

interface StackRowProps {
  id: string;
  name: string;
  usageCount: number;
}

export default function StackRow({ id, name, usageCount }: StackRowProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (draft.trim() === name) {
      setIsEditing(false);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await renameStack(id, draft);
      if (result.success) {
        setIsEditing(false);
      } else {
        setError(result.error);
      }
    });
  };

  const remove = () => {
    const message =
      usageCount > 0
        ? `Stack "${name}" dipakai oleh ${usageCount} proyek. Menghapusnya akan melepas tag ini dari proyek tersebut. Lanjutkan?`
        : `Hapus stack "${name}"?`;

    if (!confirm(message)) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteStack(id);
      if (!result.success) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-1 rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-4 dark:border-[var(--hard-border)] dark:bg-surface-2">
      <div className="flex items-center gap-3">
        {isEditing ? (
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") save();
              if (event.key === "Escape") {
                setDraft(name);
                setIsEditing(false);
                setError(null);
              }
            }}
            autoFocus
            maxLength={50}
            disabled={isPending}
            className="min-w-0 flex-1 rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3 py-1.5 text-sm text-foreground focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-[var(--hard-border)] dark:bg-surface-3 dark:text-foreground"
          />
        ) : (
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
            {name}
          </span>
        )}

        <span className="shrink-0 text-xs text-muted">
          {usageCount > 0 ? `${usageCount} proyek` : "belum dipakai"}
        </span>

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
                onClick={() => {
                  setDraft(name);
                  setIsEditing(false);
                  setError(null);
                }}
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
              Ganti Nama
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
