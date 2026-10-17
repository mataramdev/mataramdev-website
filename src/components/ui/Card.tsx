import type { ReactNode } from "react";

/**
 * Kartu dengan bahasa yang sama dengan Button: sudut tajam, border 2px,
 * bayangan offset padat (`--hard-shadow`). `interactive` menaikkan kartu
 * saat hover — efek geser alih-alih blur, khas brutalist.
 */

interface CardProps {
  /** default = permukaan kartu, muted = section abu, accent = blok aksen penuh. */
  tone?: "default" | "muted" | "accent";
  /** Naik sedikit saat hover (pilih kalau kartu memang bisa diklik). */
  interactive?: boolean;
  /** Matikan bayangan offset. Default: aktif. */
  hard?: boolean;
  className?: string;
  children: ReactNode;
}

const TONES = {
  default: "bg-surface-2 text-foreground",
  muted: "bg-surface text-foreground",
  accent: "bg-accent-500 text-white",
} as const;

export default function Card({
  tone = "default",
  interactive = false,
  hard = true,
  className = "",
  children,
}: CardProps) {
  return (
    <div
      className={[
        "rounded-card border-[3px] border-[var(--hard-border)] p-5",
        hard ? "shadow-[6px_6px_0_0_var(--hard-shadow)]" : "",
        interactive
          ? "transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[9px_9px_0_0_var(--hard-shadow)]"
          : "",
        TONES[tone],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
