"use client";

import { useState, useTransition } from "react";
import { deleteResource } from "@/lib/actions/resources";
import {
  resourceCategoryBadgeClasses,
  resourceCategoryLabel,
  resourceIcon,
} from "@/lib/resourceCategory";

interface ResourceRowProps {
  id: string;
  name: string;
  category: string;
  icon: string | null;
  downloadCount: number;
  createdAt: string;
}

export default function ResourceRow({
  id,
  name,
  category,
  icon,
  downloadCount,
  createdAt,
}: ResourceRowProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const remove = () => {
    const confirmed = confirm(
      `Hapus resource "${name}"? File-nya juga dihapus dari storage dan tidak bisa dipakai lagi.`
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteResource(id);
      if (!result.success) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-1 rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-4 dark:border-[var(--hard-border)] dark:bg-surface-2">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-surface-3 text-xl dark:bg-surface-3">
          {resourceIcon(category, icon)}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {name}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${resourceCategoryBadgeClasses(category)}`}
            >
              {resourceCategoryLabel(category)}
            </span>
            <span>{downloadCount} unduhan</span>
            <span>•</span>
            <span>{createdAt}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={`/resource/${id}/download`}
            className="rounded-btn border-[3px] border-[var(--hard-border)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-3 dark:border-[var(--hard-border)] dark:text-foreground dark:hover:bg-surface-3"
          >
            Unduh
          </a>
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
