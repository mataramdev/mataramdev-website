"use client";

import { useTransition, useState } from "react";
import { publishPost } from "@/lib/actions/posts";

export default function PublishDraftButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="text-right">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await publishPost(postId);
            if (!result.success) setError(result.error);
          });
        }}
        className="rounded-btn bg-accent-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-600 disabled:opacity-50"
      >
        {isPending ? "Menerbitkan..." : "Terbitkan"}
      </button>
      {error && (
        <p className="mt-1 text-xs text-accent-600 dark:text-accent-400">{error}</p>
      )}
    </div>
  );
}
