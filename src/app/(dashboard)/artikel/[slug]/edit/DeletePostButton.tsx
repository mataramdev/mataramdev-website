"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "@/lib/actions/posts";

interface DeletePostButtonProps {
  postId: string;
  slug: string;
}

export default function DeletePostButton({
  postId,
  slug,
}: DeletePostButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (
      !confirm(
        `Hapus artikel ini secara permanen?\n\nSlug: ${slug}\n\nTindakan ini tidak bisa dibatalkan.`
      )
    ) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await deletePost(postId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      // The edit page no longer exists after a successful delete, so navigate
      // away instead of refreshing it.
      router.push("/artikel-saya?deleted=1");
      router.refresh();
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-btn bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Menghapus..." : "Hapus Artikel"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-accent-600 dark:text-accent-400">{error}</p>
      )}
    </div>
  );
}
