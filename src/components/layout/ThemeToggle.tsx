"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

/**
 * Tema hanya diketahui di browser, jadi render pertama harus sama dengan
 * server (tanpa tema) dan baru berubah setelah hydration. `useSyncExternalStore`
 * menjawab pertanyaan "sudah di client belum?" tanpa `setState` di dalam
 * effect — pola itu memicu cascading render dan ditolak oleh lint.
 */
const subscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true, // snapshot di client
    () => false // snapshot di server, dan saat hydration
  );
}

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  if (!isClient) {
    return <div className="size-10" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 text-foreground"
      aria-label="Ganti mode gelap/terang"
    >
      {theme === "dark" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
}
