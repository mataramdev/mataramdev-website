"use client";

import { useState, useTransition } from "react";
import {
  deleteActivity,
  moveActivity,
  updateActivity,
} from "@/lib/actions/activities";

interface ActivityRowProps {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  position: number;
  total: number;
}

export default function ActivityRow({
  id,
  name,
  description,
  icon,
  color,
  position,
  total,
}: ActivityRowProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    name,
    description: description ?? "",
    icon: icon ?? "",
    color: color ?? "",
  });
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
      const result = await updateActivity(id, draft);
      if (result.success) {
        setIsEditing(false);
      }
      return result;
    });
  };

  const cancelEdit = () => {
    setDraft({
      name,
      description: description ?? "",
      icon: icon ?? "",
      color: color ?? "",
    });
    setIsEditing(false);
    setError(null);
  };

  const remove = () => {
    if (!confirm(`Hapus aktivitas "${name}"?`)) return;
    run(() => deleteActivity(id));
  };

  return (
    <div className="flex flex-col gap-2 rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-4 dark:border-[var(--hard-border)] dark:bg-surface-2">
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 flex-col items-center gap-0.5 pt-0.5">
          <button
            onClick={() => run(() => moveActivity(id, "up"))}
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
            onClick={() => run(() => moveActivity(id, "down"))}
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
              <div className="flex gap-2">
                <input
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, name: event.target.value }))
                  }
                  disabled={isPending}
                  minLength={2}
                  maxLength={80}
                  autoFocus
                  className="block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3 py-2 text-sm font-medium text-foreground focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-[var(--hard-border)] dark:bg-surface-3 dark:text-foreground"
                />
                <input
                  value={draft.icon}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, icon: event.target.value }))
                  }
                  disabled={isPending}
                  maxLength={8}
                  placeholder="Ikon"
                  className="w-20 shrink-0 rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-2 py-2 text-center text-sm text-foreground focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-[var(--hard-border)] dark:bg-surface-3 dark:text-foreground"
                />
                <input
                  value={draft.color}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, color: event.target.value }))
                  }
                  disabled={isPending}
                  maxLength={7}
                  placeholder="#3b82f6"
                  className="w-28 shrink-0 rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-2 py-2 text-sm text-foreground focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-[var(--hard-border)] dark:bg-surface-3 dark:text-foreground"
                />
              </div>
              <textarea
                value={draft.description}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                disabled={isPending}
                rows={3}
                maxLength={300}
                className="block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-[var(--hard-border)] dark:bg-surface-3 dark:text-foreground"
              />
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn text-lg"
                style={{ backgroundColor: color ? `${color}22` : undefined }}
              >
                {icon || "•"}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {name}
                </p>
                {description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {description}
                  </p>
                )}
              </div>
            </div>
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
