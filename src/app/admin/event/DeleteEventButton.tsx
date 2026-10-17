"use client";

import { useTransition } from "react";
import { deleteEvent } from "@/lib/actions/events";

interface DeleteEventButtonProps {
  eventId: string;
}

export default function DeleteEventButton({ eventId }: DeleteEventButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Yakin ingin menghapus event ini?")) return;

    startTransition(async () => {
      await deleteEvent(eventId);
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-btn border border-accent-500 px-3 py-1.5 text-xs font-medium text-accent-600 transition-colors hover:bg-accent-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-accent-700 dark:text-accent-500 dark:hover:bg-accent-950"
    >
      {isPending ? "..." : "Hapus"}
    </button>
  );
}
