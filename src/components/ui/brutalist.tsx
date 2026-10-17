import Image from "next/image";
import Link from "next/link";
import { oneRelation } from "@/lib/utils";
import { pickThumbnail, type ThumbnailKind } from "@/lib/thumbnails";

/**
 * Primitive bersama bahasa desain neo-brutalist.
 *
 * Sumber angka & warna: `ui_design_canva/html/Mataram Dev — Wadah Kolaborasi
 * Talenta Digital Kota Mataram.html` (export 6 Okt 2026) + ringkasan terukur di
 * `docs/DESIGN-BRIEF.md`. Sebelumnya blok ini hidup di dalam
 * `src/app/(public)/page.tsx`; sekarang diangkat ke sini supaya semua halaman
 * memakai ukuran, radius, dan bayangan yang sama (CONVENTIONS §2 & §6).
 *
 * Aturan yang berlaku di seluruh situs:
 * - border/sombra selalu lewat `var(--hard-border)`/`var(--hard-shadow)`, bukan
 *   `black`, supaya versi gelap tidak berubah jadi hitam-di-atas-hitam;
 * - bidang warna penuh (hero, band section) memakai token `brand-*`/`accent-*`
 *   dengan pasangan `dark:` dari hasil ukur PNG gelap.
 */

/** Lebar konten 1360px — hasil ukur mockup (DESIGN-BRIEF §3). */
export const CONTAINER = "mx-auto w-full max-w-[1360px] px-5 sm:px-10";

/** Blok teks sempit 816px (FAQ, paragraf panjang). */
export const NARROW = "mx-auto w-full max-w-[816px] px-5 sm:px-10";

/** Bayangan offset padat — geser, bukan blur. */
export const HARD_CARD =
  "rounded-card border-[3px] border-[var(--hard-border)] shadow-[6px_6px_0_0_var(--hard-shadow)]";

export const HARD_CARD_SM =
  "rounded-card border-[3px] border-[var(--hard-border)] shadow-[4px_4px_0_0_var(--hard-shadow)]";

export const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-btn border-[3px] border-[var(--hard-border)] px-6 py-3.5 font-black text-sm uppercase tracking-wide shadow-[5px_5px_0_0_var(--hard-shadow)] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-[3px_3px_0_0_var(--hard-shadow)] disabled:cursor-not-allowed disabled:opacity-50";

export const BTN_RED = `${BTN_BASE} bg-accent-500 text-white hover:bg-accent-600`;
export const BTN_WHITE = `${BTN_BASE} bg-surface-2 text-foreground`;
export const BTN_TEAL = `${BTN_BASE} bg-teal-500 text-white hover:bg-teal-600`;
export const BTN_DARK = `${BTN_BASE} bg-brand-ink text-white hover:bg-black`;

/** Tombol kecil: dipakai di kartu/tabel padat. */
export const BTN_SM_BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-btn border-[3px] border-[var(--hard-border)] px-4 py-2 font-black text-xs uppercase tracking-wide shadow-[3px_3px_0_0_var(--hard-shadow)] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--hard-shadow)] disabled:cursor-not-allowed disabled:opacity-50";

export const BTN_SM_RED = `${BTN_SM_BASE} bg-accent-500 text-white hover:bg-accent-600`;
export const BTN_SM_WHITE = `${BTN_SM_BASE} bg-surface-2 text-foreground`;
export const BTN_SM_TEAL = `${BTN_SM_BASE} bg-teal-500 text-white hover:bg-teal-600`;
export const BTN_SM_DARK = `${BTN_SM_BASE} bg-brand-ink text-white`;

/** Label kecil bergaya badge desain: siku, border 2px, huruf kapital. */
export const NEO_BADGE =
  "inline-block border-2 border-[var(--hard-border)] px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider";

/** Input/textarea/select form bergaya brutalist. */
export const FIELD =
  "mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500";

export const LABEL = "block font-mono text-xs font-bold uppercase tracking-wide text-foreground";

/**
 * Badge status event. Desain hanya menentukan dua dari empat status (selesai
 * abu, akan datang teal) dan keduanya berteks putih. Dua sisanya dipilih yang
 * lebih gelap supaya **semua** lolos kontras WCAG AA dengan teks putih:
 * teal 6,15:1 · merah gelap 4,98:1 · abu 5,0:1 · hampir hitam 17:1.
 */
export const STATUS_TAG: Record<string, string> = {
  upcoming: "bg-teal-500",
  ongoing: "bg-accent-700",
  completed: "bg-zinc-500",
  cancelled: "bg-brand-ink",
};

export const CATEGORY_TAG: Record<string, string> = {
  tutorial: "bg-brand-blue",
  tips: "bg-accent-500",
  event: "bg-teal-500",
  story: "bg-brand-purple",
};

/** Warna badge untuk kategori resource. */
export const RESOURCE_TAG: Record<string, string> = {
  code: "bg-brand-green",
  doc: "bg-brand-blue",
  design: "bg-brand-purple",
  video: "bg-brand-orange",
};

/** Badge status moderasi proyek (halaman dashboard/admin). */
export const PROJECT_STATUS_TAG: Record<string, string> = {
  pending: "bg-brand-gold",
  approved: "bg-brand-green",
  rejected: "bg-accent-500",
};

/**
 * Menyeragamkan hasil query jadi satu bentuk: `failed` inilah yang membedakan
 * "backend bermasalah" dari "memang belum ada data". Tanpa ini, database yang
 * mati akan tampil sebagai section kosong yang menyesatkan.
 */
export function toSection<T>(result: {
  data: unknown;
  error: { message: string } | null;
}): { rows: T[]; failed: boolean } {
  return {
    rows: (result.data ?? []) as T[],
    failed: Boolean(result.error),
  };
}

/** Dipakai kalau anggota belum punya foto. */
export function initials(name: string | null | undefined): string {
  const source = (name ?? "").trim() || "?";
  const parts = source.split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

/**
 * Warna teks di atas tile aktivitas, yang warnanya datang dari database.
 *
 * Ambang 0,203 diambil dari titik di mana kontras hitam dan putih bertemu
 * (luminance relatif, WCAG): di bawah itu teks putih menang, di atasnya teks
 * gelap menang. Jadi kombinasi apa pun yang dipilih admin tetap ≥4,5:1.
 */
export function tileTextClass(hex: string | null): string {
  if (!hex) return "text-foreground";

  const value = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return "text-foreground";

  const [r, g, b] = [0, 2, 4].map((offset) => {
    const channel = parseInt(value.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > 0.203 ? "text-brand-ink" : "text-white";
}

/** "19.00 – 21.00" — jam lokal server, sama seperti formatDate/formatDateTime. */
export function timeRange(
  start: string | null,
  end: string | null,
): string | null {
  if (!start) return null;

  const time = (iso: string) =>
    new Date(iso).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return end ? `${time(start)} – ${time(end)}` : time(start);
}

/** "2 Jam" / "1,5 Jam" — null kalau salah satu jam tidak ada. */
export function durationLabel(
  start: string | null,
  end: string | null,
): string | null {
  if (!start || !end) return null;

  const hours =
    (new Date(end).getTime() - new Date(start).getTime()) / 3_600_000;
  if (!(hours > 0)) return null;

  return Number.isInteger(hours)
    ? `${hours} Jam`
    : `${hours.toFixed(1).replace(".", ",")} Jam`;
}

/** "@aldi, @rifqi" — maksimal `max` nama, dilewati kalau belum ada kontributor. */
export function contributorLabels(
  rows: { users: unknown }[] | null | undefined,
  max = 3,
): string[] {
  return (rows ?? [])
    .map((row) => oneRelation(row.users))
    .filter(
      (user): user is { username: string | null; fullname: string | null } =>
        Boolean(user),
    )
    .slice(0, max)
    .map((user) =>
      user.username ? `@${user.username}` : user.fullname || "Anggota",
    );
}

/** Badge section dengan latar aksen + judul besar. */
export function SectionHeading({
  badge,
  title,
  description,
  align = "left",
}: {
  badge?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      {badge && (
        <span className={`${NEO_BADGE} bg-accent-500 text-white`}>{badge}</span>
      )}
      <h2 className="mt-4 font-black uppercase leading-none text-3xl sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && <p className="mt-2 text-base text-muted">{description}</p>}
    </div>
  );
}

/** Gagal memuat section — bukan "kosong". */
export function SectionError({ what }: { what: string }) {
  return (
    <div className={`${HARD_CARD} mt-8 bg-surface-2 p-8 text-center text-foreground`}>
      <p className="text-sm text-muted">
        Gagal memuat {what} dari server — ini bukan berarti belum ada {what}.
        Coba muat ulang sebentar lagi.
      </p>
    </div>
  );
}

/** Empty state bergaya kartu. */
export function SectionEmpty({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${HARD_CARD} mt-8 bg-surface-2 p-10 text-center text-foreground`}>
      <p className="text-muted">{children}</p>
    </div>
  );
}

/** CTA di tengah bawah section. */
export function CenterCta({
  href,
  label,
  tone,
}: {
  href: string;
  label: string;
  tone: string;
}) {
  return (
    <div className="flex justify-center pt-10">
      <Link href={href} className={tone}>
        {label} →
      </Link>
    </div>
  );
}

/**
 * Header halaman daftar/detail: judul besar uppercase + deskripsi, dengan
 * badge opsional dan slot aksi di kanan.
 */
export function PageHeader({
  badge,
  title,
  description,
  actions,
}: {
  badge?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        {badge && (
          <span className={`${NEO_BADGE} bg-accent-500 text-white`}>{badge}</span>
        )}
        <h1 className="mt-4 font-black uppercase leading-none text-3xl sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-base text-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}

/** Tautan kembali bergaya chip kecil. */
export function BackLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wide text-foreground shadow-[3px_3px_0_0_var(--hard-shadow)]"
    >
      {children}
    </Link>
  );
}

/**
 * Kotak gambar kartu: foto asli kalau ada; kalau kosong, foto cadangan dari
 * `public/images/` yang dipilih deterministik dari `seed` (slug) — dan ikon
 * emoji hanya jika pool-nya tidak tersedia.
 */
export function CardImage({
  src,
  alt,
  sizes,
  emoji,
  fallbackKind,
  seed,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  emoji: string;
  /** Pool aset gambar yang dipakai saat `src` kosong. */
  fallbackKind?: ThumbnailKind;
  /** Seed deterministik (slug konten) supaya gambarnya tidak berubah tiap render. */
  seed?: string;
}) {
  const resolved =
    src ?? (fallbackKind && seed ? pickThumbnail(fallbackKind, seed) : null);

  return (
    <div className="relative h-44 shrink-0 border-b-[3px] border-[var(--hard-border)] bg-gradient-to-br from-zinc-600 to-zinc-900">
      {resolved ? (
        <Image src={resolved} alt={alt} fill sizes={sizes} className="object-cover" />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-full items-center justify-center text-4xl"
        >
          {emoji}
        </span>
      )}
    </div>
  );
}

/** Item FAQ accordion (dipakai di halaman depan & /faq). */
export function FaqItem({
  question,
  answer,
  number,
  defaultOpen = false,
}: {
  question: string;
  answer: string;
  /** Nomor urut opsional (halaman /faq memakai 01, 02, …). */
  number?: string;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className={`${HARD_CARD} group bg-surface-2 text-foreground`}
    >
      <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
        <span className="flex items-baseline gap-3">
          {number && (
            <span className="shrink-0 font-mono text-sm font-bold tabular-nums text-muted">
              {number}
            </span>
          )}
          <span className="font-black text-base">{question}</span>
        </span>
        <span
          aria-hidden="true"
          className="relative flex size-8 shrink-0 items-center justify-center border-2 border-[var(--hard-border)] bg-accent-500"
        >
          <span className="absolute left-1/2 top-1/2 h-0.5 w-3.5 -translate-x-1/2 -translate-y-1/2 bg-white" />
          <span className="absolute left-1/2 top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-white group-open:hidden" />
        </span>
      </summary>
      <div className="border-t-[3px] border-[var(--hard-border)] p-5">
        <p className="text-base leading-relaxed text-muted">{answer}</p>
      </div>
    </details>
  );
}

/**
 * Chip filter (kategori/stack/tag). Aktif = blok aksen dengan bayangan keras,
 * non-aktif = permukaan kartu.
 */
export function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 rounded-btn border-[3px] border-[var(--hard-border)] px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
        active
          ? "bg-brand-ink text-white shadow-[3px_3px_0_0_var(--hard-shadow)]"
          : "bg-surface-2 text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}
