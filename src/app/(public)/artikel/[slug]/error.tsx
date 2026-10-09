"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ArticleDetailError({
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
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-accent-700 p-8 text-center text-white">
        <h2 className="text-lg font-semibold text-white">
          Gagal memuat detail artikel
        </h2>
        <p className="mt-2 text-sm text-white/90">
          Artikel ini mungkin ada, tapi server gagal mengambil datanya. Coba
          lagi sebentar lagi.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-btn bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700"
          >
            Coba Lagi
          </button>
          <Link
            href="/artikel"
            className="rounded-btn border border-accent-500 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-accent-100 dark:border-accent-700 dark:text-accent-300 dark:hover:bg-accent-900"
          >
            Kembali ke daftar artikel
          </Link>
        </div>
      </div>
    </div>
  );
}
