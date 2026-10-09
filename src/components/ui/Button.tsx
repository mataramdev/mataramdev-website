import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Tombol dengan bahasa desain brutalist: sudut tajam, border tebal, dan
 * bayangan offset padat tanpa blur (`--hard-shadow`, ikut terang/gelap).
 *
 * Server component — aman dipakai di mana pun, termasuk dari client component.
 */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Ganti isi tombol jadi indikator + `aria-busy`, tombol ikut terkunci. */
  loading?: boolean;
  /** Matikan bayangan offset (untuk baris padat). Default: aktif. */
  hard?: boolean;
  children: ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "border-[var(--hard-border)] bg-accent-500 text-white hover:bg-accent-600",
  secondary:
    "border-[var(--hard-border)] bg-surface-2 text-foreground hover:bg-surface",
  ghost: "border-transparent bg-transparent hover:bg-surface",
  danger:
    "border-[var(--hard-border)] bg-accent-700 text-white hover:bg-accent-800",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 px-3 text-xs",
  md: "h-11 gap-2 px-5 text-sm",
  lg: "h-12 gap-2 px-7 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  hard = true,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={props.type ?? "button"}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        "inline-flex items-center justify-center rounded-btn border-[3px] font-black",
        "uppercase tracking-wide transition-[transform,box-shadow,background-color]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        hard
          ? "shadow-[5px_5px_0_0_var(--hard-shadow)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[3px_3px_0_0_var(--hard-shadow)]"
          : "",
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(" ")}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
