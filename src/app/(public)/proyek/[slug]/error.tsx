"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ProjectDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ProjectDetail]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/proyek"
        className="text-sm font-medium text-teal-600 hover:underline dark:text-teal-300"
      >
        ← Kembali ke proyek
      </Link>

      <div className="mt-8 rounded-card border-[3px] border-[var(--hard-border)] bg-accent-700 p-8 text-center text-white">
        <p className="text-lg font-semibold text-white">
          Gagal memuat detail proyek
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
    </div>
  );
}
