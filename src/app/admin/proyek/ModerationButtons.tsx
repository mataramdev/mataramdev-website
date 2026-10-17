"use client";

import { useState, useTransition } from "react";
import { moderateProject, deleteProject } from "@/lib/actions/projects";
import type { ProjectStatus } from "@/lib/projectStatus";

interface ModerationButtonsProps {
  projectId: string;
  status: string;
}

export default function ModerationButtons({
  projectId,
  status,
}: ModerationButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const busy = isPending || isDeleting;

  const run = (next: ProjectStatus, confirmMessage?: string) => {
    if (confirmMessage && !confirm(confirmMessage)) return;

    setError(null);
    startTransition(async () => {
      const result = await moderateProject(projectId, next);
      if (!result.success) {
        setError(result.error);
      }
    });
  };

  // Task 9.5: permanent removal, including its stacks/contributors and cover.
  const remove = () => {
    if (
      !confirm(
        "Hapus proyek ini secara permanen? Stack, kontributor, dan gambarnya ikut terhapus. Tindakan ini tidak bisa dibatalkan."
      )
    ) {
      return;
    }

    setError(null);
    startDelete(async () => {
      const result = await deleteProject(projectId);
      if (!result.success) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex shrink-0 items-center gap-2">
        {status !== "approved" && (
          <button
            onClick={() => run("approved")}
            disabled={busy}
            className="rounded-btn bg-brand-green px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-green disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "..." : "Setujui"}
          </button>
        )}

        {status !== "rejected" && (
          <button
            onClick={() =>
              run("rejected", "Tolak proyek ini? Publik tidak akan melihatnya.")
            }
            disabled={busy}
            className="rounded-btn border border-accent-500 px-3 py-1.5 text-xs font-medium text-accent-600 transition-colors hover:bg-accent-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-accent-700 dark:text-accent-500 dark:hover:bg-accent-950"
          >
            {isPending ? "..." : "Tolak"}
          </button>
        )}

        {status !== "pending" && (
          <button
            onClick={() => run("pending")}
            disabled={busy}
            className="rounded-btn border-[3px] border-[var(--hard-border)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[var(--hard-border)] dark:text-foreground dark:hover:bg-surface-3"
          >
            {isPending ? "..." : "Kembalikan"}
          </button>
        )}

        <button
          onClick={remove}
          disabled={busy}
          className="rounded-btn bg-accent-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? "..." : "Hapus"}
        </button>
      </div>

      {error && (
        <p className="max-w-xs text-right text-xs text-accent-600 dark:text-accent-400">
          {error}
        </p>
      )}
    </div>
  );
}
