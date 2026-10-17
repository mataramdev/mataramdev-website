"use client";

import { useEffect } from "react";

export default function AdminStacksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminStacks]", error);
  }, [error]);

  return (
    <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-accent-700 p-8 text-center text-white">
      <p className="text-lg font-semibold text-white">
        Gagal memuat daftar stack
      </p>
      <p className="mt-2 text-sm text-white/90">
        Terjadi kesalahan saat menghubungi server. Silakan coba lagi.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-white/70">
          Error ID: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="mt-4 rounded-btn bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700"
      >
        Coba lagi
      </button>
    </div>
  );
}
