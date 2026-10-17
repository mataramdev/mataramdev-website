"use client";

import { useEffect } from "react";

/**
 * Jaring pengaman untuk halaman publik yang belum punya `error.tsx` sendiri
 * (mis. halaman depan). Halaman yang sudah punya boundary sendiri tetap memakai
 * miliknya, karena Next.js memilih boundary terdekat.
 */
export default function PublicError({
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
          Gagal memuat halaman
        </h2>
        <p className="mt-2 text-sm text-white/90">
          Ada masalah saat mengambil data dari server. Halaman ini bukan kosong —
          datanya belum berhasil diambil. Coba muat ulang sebentar lagi.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-btn bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
