"use client";

import { useEffect } from "react";

export default function NewProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-accent-700 p-8 text-center text-white">
      <h2 className="text-lg font-semibold text-white">
        Gagal memuat formulir proyek
      </h2>
      <p className="mt-2 text-sm text-white/90">
        Daftar stack belum bisa diambil dari server — ini bukan berarti tidak
        ada stack. Coba lagi sebentar lagi.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-btn bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700"
      >
        Coba Lagi
      </button>
    </div>
  );
}
