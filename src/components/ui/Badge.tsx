import type { ReactNode } from "react";

/**
 * Label status kecil: sudut tajam, huruf kapital, border 1px.
 * Dipakai untuk status event/proyek/artikel dan kategori.
 */

export type BadgeVariant =
  | "neutral"
  | "accent"
  | "teal"
  | "success"
  | "warning"
  | "danger";

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}

const VARIANTS: Record<BadgeVariant, string> = {
  neutral: "bg-surface-3 text-foreground",
  accent: "bg-accent-500 text-white",
  teal: "bg-teal-500 text-white",
  success: "bg-brand-green text-white",
  warning: "bg-brand-gold text-black",
  danger: "bg-accent-700 text-white",
};

export default function Badge({
  variant = "neutral",
  className = "",
  children,
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center border-2 border-[var(--hard-border)] px-2 py-0.5",
        "font-mono text-[11px] font-bold uppercase leading-none tracking-wider",
        VARIANTS[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
