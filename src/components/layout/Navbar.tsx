"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Brand from "./Brand";
import ThemeToggle from "./ThemeToggle";
import Icon, { type IconName } from "@/components/ui/icons";

/**
 * Navbar neo-brutalist — mengikuti `ui_design_canva/html/...` apa adanya:
 * header sticky putih berborder 3px, wordmark + mark conic-gradient, tiga menu
 * mega (Komunitas, Kursus, Lainnya) yang terbuka saat diklik, dan blok kanan
 * berisi toggle tema, tombol bahasa, serta tombol Masuk.
 *
 * Catatan penyimpangan kecil (dicatat di docs/PROGRESS.md): item mega menu yang
 * halamannya belum ada tetap ditampilkan persis seperti mockup, tapi sebagai
 * `<div>` non-klik — bukan tautan mati. Item yang punya halaman asli memakai
 * `<Link>`.
 */

/**
 * Mark bawaan dari `public/images/logo/` — dipakai HANYA saat admin belum
 * mengunggah logo sendiri di `/admin/pengaturan`.
 *
 * Ini hanya GAMBAR MARK-nya; wordmark "MATARAM <DEV>" tetap dirender sebagai
 * teks di sebelahnya (persis mockup: `<span class="mark"></span>MATARAM <DEV>`).
 *
 * `mark-light.svg` / `mark-dark.svg` adalah turunan dari `logo-dark.svg` /
 * `logo.svg` dengan viewBox yang sudah dipangkas ke bounding box mark, supaya
 * mark memenuhi kotaknya (bukan 52%×34% dari kanvas persegi yang membuatnya
 * tampak mungil saat di-`h-8`). Varian gelap dipakai di tema terang, varian
 * terang dipakai di tema gelap.
 */
const DEFAULT_LIGHT_LOGO = "/images/logo/mark-light.svg";
const DEFAULT_DARK_LOGO = "/images/logo/mark-dark.svg";

interface NavbarProps {
  isLoggedIn: boolean;
  /** Menampilkan pintasan ke panel admin di samping pintasan dashboard. */
  isAdmin?: boolean;
  /** Nama komunitas untuk wordmark (fallback kalau belum ada logo). */
  name?: string;
  /** Community logo for the light theme (Task 9.3 / PRD §4.7). */
  lightLogoUrl?: string | null;
  /** Community logo for the dark theme. Falls back to the text wordmark. */
  darkLogoUrl?: string | null;
}

interface MegaItem {
  /** Kunci ikon dari `src/components/ui/icons.tsx` (bukan emoji/glif). */
  icon: IconName;
  label: string;
  sub?: string;
  href?: string;
}

interface MegaColumn {
  heading: string;
  items: MegaItem[];
}

interface MegaMenu {
  label: string;
  introTitle: string;
  introText: string;
  introHref: string;
  columns: MegaColumn[];
}

/**
 * Isi mega menu disalin dari mockup. `href` hanya diisi kalau halamannya benar
 * ada di aplikasi ini; sisanya sengaja tanpa href (placeholder).
 */
const MEGA_MENUS: MegaMenu[] = [
  {
    label: "Komunitas",
    introTitle: "Komunitas",
    introText:
      "Bergabung, berkontribusi, dan tumbuh bersama developer & designer Mataram.",
    introHref: "/anggota",
    columns: [
      {
        heading: "Platform",
        items: [
          { icon: "users", label: "Kontributor", sub: "Kenali anggota aktif", href: "/anggota" },
          { icon: "chat", label: "Forum (Q&A)", sub: "Tanya & diskusi" },
        ],
      },
      {
        heading: "Kontak",
        items: [
          { icon: "camera", label: "Instagram" },
          { icon: "send", label: "Telegram" },
          { icon: "gamepad", label: "Discord" },
          { icon: "phone", label: "WhatsApp" },
        ],
      },
      {
        heading: "Lainnya",
        items: [
          { icon: "package", label: "Proyek", sub: "Proyek komunitas", href: "/proyek" },
          { icon: "download", label: "Sumber Daya", sub: "Tools & referensi", href: "/resource" },
          { icon: "shield", label: "Kode Etik", sub: "Panduan komunitas" },
        ],
      },
    ],
  },
  {
    label: "Kursus",
    introTitle: "Kursus",
    introText:
      "Pelajari skill baru bersama mentor dan komunitas Mataram Dev.",
    introHref: "/resource",
    columns: [
      {
        heading: "Tech Skills",
        items: [
          { icon: "shield", label: "Keamanan Siber", sub: "Ethical hacking & security" },
          { icon: "code", label: "Fullstack Dev", sub: "Web dari nol sampai deploy" },
          { icon: "cpu", label: "AI / ML", sub: "Machine learning & LLM" },
          { icon: "briefcase", label: "Product Manager", sub: "Strategi & roadmap produk" },
        ],
      },
      {
        heading: "Desain",
        items: [
          { icon: "palette", label: "Desain Logo", sub: "Branding & identitas" },
          { icon: "palette", label: "Brand Identity", sub: "Visual language" },
          { icon: "layout", label: "UI / UX", sub: "Figma, prototyping, riset" },
        ],
      },
      {
        heading: "Bahasa",
        items: [
          { icon: "globe", label: "Bahasa Inggris", sub: "English for tech" },
          { icon: "globe", label: "Bahasa Jepang", sub: "N5 ~ N3" },
          { icon: "globe", label: "Bahasa Arab", sub: "Modern standard Arabic" },
        ],
      },
    ],
  },
  {
    label: "Lainnya",
    introTitle: "Tentang Kami",
    introText:
      "Cerita, nilai, galeri, dan cara kamu terlibat lebih dalam di Mataram Dev.",
    introHref: "/tentang",
    columns: [
      {
        heading: "Tentang",
        items: [
          { icon: "heart", label: "Cerita Kami", sub: "Bagaimana kami bermula", href: "/tentang" },
          { icon: "target", label: "Visi & Misi", sub: "Tujuan & arah komunitas", href: "/tentang" },
          { icon: "image", label: "Galeri Foto", sub: "Dokumentasi kegiatan" },
          { icon: "video", label: "Galeri Video", sub: "Rekaman event & tech talk" },
        ],
      },
      {
        heading: "Bergabung",
        items: [
          { icon: "users", label: "Anggota", sub: "Direktori anggota", href: "/anggota" },
          { icon: "handshake", label: "Kemitraan", sub: "Kolaborasi & sponsorship" },
          { icon: "download", label: "Open Source", sub: "Kontribusi ke proyek lokal", href: "/resource" },
          { icon: "book", label: "Dokumentasi", sub: "Wiki & panduan resmi" },
        ],
      },
    ],
  },
];

/** Semua tautan asli, dipakai oleh menu mobile. */
const MOBILE_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Event", href: "/event" },
  { label: "Proyek", href: "/proyek" },
  { label: "Artikel", href: "/artikel" },
  { label: "Anggota", href: "/anggota" },
  { label: "Resource Gratis", href: "/resource" },
  { label: "Tentang", href: "/tentang" },
  { label: "FAQ", href: "/faq" },
];

function MegaItemRow({ item }: { item: MegaItem }) {
  const content = (
    <>
      <span
        aria-hidden="true"
        className="flex size-7 shrink-0 items-center justify-center border-[1.5px] border-[var(--hard-border)] text-teal-500"
      >
        <Icon name={item.icon} className="size-4" />
      </span>
      <span>
        <strong className="block font-black text-[13px] uppercase">
          {item.label}
        </strong>
        {item.sub && (
          <span className="mt-0.5 block text-xs text-muted">{item.sub}</span>
        )}
      </span>
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="flex gap-2.5 hover:text-teal-500">
        {content}
      </Link>
    );
  }

  // Placeholder: halamannya belum ada, jadi bukan tautan (bukan link mati).
  return (
    <div className="flex gap-2.5 text-muted" title="Segera hadir">
      {content}
    </div>
  );
}

export default function Navbar({
  isLoggedIn,
  isAdmin = false,
  name = "Mataram Dev",
  lightLogoUrl,
  darkLogoUrl,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLUListElement>(null);

  // Either upload can stand in for both themes — a logo is better than the
  // plain mark even if the matching-theme variant is missing. Kalau admin belum
  // mengunggah apa pun, pakai mark bawaan.
  const lightLogo = lightLogoUrl || darkLogoUrl || DEFAULT_LIGHT_LOGO;
  const darkLogo = darkLogoUrl || lightLogoUrl || DEFAULT_DARK_LOGO;

  // Klik di luar menu (atau Escape) menutup mega menu yang sedang terbuka.
  useEffect(() => {
    if (!openMenu) return;

    const onPointerDown = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-[var(--hard-border)] bg-surface-2">
      <nav className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-foreground"
          aria-label={name}
        >
          <Brand name={name} lightLogo={lightLogo} darkLogo={darkLogo} />
        </Link>

        {/* Desktop nav */}
        <ul ref={navRef} className="hidden items-center gap-0.5 lg:flex">
          <li>
            <Link
              href="/"
              className="flex items-center gap-1 px-3 py-2 font-bold text-sm uppercase text-foreground hover:text-teal-500"
            >
              Beranda
            </Link>
          </li>
          <li>
            <Link
              href="/event"
              className="flex items-center gap-1 px-3 py-2 font-bold text-sm uppercase text-foreground hover:text-teal-500"
            >
              Event
            </Link>
          </li>

          {MEGA_MENUS.map((menu) => {
            const isOpen = openMenu === menu.label;

            return (
              <li key={menu.label} className="relative">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  onClick={() => setOpenMenu(isOpen ? null : menu.label)}
                  className={`flex items-center gap-1 px-3 py-2 font-bold text-sm uppercase ${
                    isOpen ? "bg-brand-yellow text-black" : "text-foreground hover:text-teal-500"
                  }`}
                >
                  {menu.label}
                  <span
                    aria-hidden="true"
                    className={`inline-block size-[7px] border-b-[1.5px] border-r-[1.5px] border-current ${
                      isOpen
                        ? "-translate-y-0.5 rotate-[-135deg]"
                        : "translate-y-[-2px] rotate-45"
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="absolute left-1/2 top-[calc(100%+3px)] grid w-[min(820px,92vw)] -translate-x-1/2 grid-cols-[220px_1px_1fr] border-[3px] border-t-0 border-[var(--hard-border)] bg-surface-2 p-8 shadow-[10px_10px_0_0_var(--hard-shadow)]">
                    <div>
                      <h3 className="font-black text-2xl uppercase">
                        {menu.introTitle}
                      </h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-muted">
                        {menu.introText}
                      </p>
                      <Link
                        href={menu.introHref}
                        className="mt-4 inline-flex items-center rounded-btn border-[3px] border-[var(--hard-border)] bg-accent-500 px-4 py-2 font-black text-xs uppercase text-white shadow-[3px_3px_0_0_var(--hard-shadow)]"
                      >
                        Lihat Semua →
                      </Link>
                    </div>

                    <div className="bg-black/10" />

                    <div
                      className={`grid gap-6 pl-7 ${
                        menu.columns.length === 2 ? "grid-cols-2" : "grid-cols-3"
                      }`}
                    >
                      {menu.columns.map((column) => (
                        <div key={column.heading}>
                          <h5 className="mb-3 border-b-2 border-[var(--hard-border)] pb-2 font-black text-[11px] uppercase tracking-wider text-teal-500">
                            {column.heading}
                          </h5>
                          <ul className="flex flex-col gap-4">
                            {column.items.map((item) => (
                              <li key={item.label}>
                                <MegaItemRow item={item} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Kanan */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden items-center gap-1.5 rounded-btn border-[3px] border-[var(--hard-border)] bg-brand-purple px-3.5 py-2 font-black text-xs uppercase text-white shadow-[3px_3px_0_0_var(--hard-shadow)] lg:inline-flex"
                >
                  <Icon name="shield" className="size-3.5" />
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="hidden items-center gap-2 rounded-btn border-[3px] border-[var(--hard-border)] bg-teal-500 px-4 py-2 font-black text-xs uppercase text-white shadow-[3px_3px_0_0_var(--hard-shadow)] sm:inline-flex"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden items-center gap-2 rounded-btn border-[3px] border-[var(--hard-border)] bg-teal-500 px-4 py-2 font-black text-xs uppercase text-white shadow-[3px_3px_0_0_var(--hard-shadow)] sm:inline-flex"
              >
                → Masuk
              </Link>
              <Link
                href="/register"
                className="hidden items-center gap-2 rounded-btn border-[3px] border-[var(--hard-border)] bg-accent-500 px-4 py-2 font-black text-xs uppercase text-white shadow-[3px_3px_0_0_var(--hard-shadow)] lg:inline-flex"
              >
                Daftar
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex size-10 items-center justify-center rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 text-foreground lg:hidden"
            aria-label="Buka menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="border-t-[3px] border-[var(--hard-border)] bg-surface-2 px-5 py-5 lg:hidden">
          <ul className="grid gap-1.5">
            {MOBILE_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-btn border-[3px] border-[var(--hard-border)] bg-surface px-4 py-2.5 font-bold text-sm uppercase"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-btn border-[3px] border-[var(--hard-border)] bg-brand-purple px-4 py-2.5 text-center font-black text-sm uppercase text-white"
                  >
                    Panel Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-btn border-[3px] border-[var(--hard-border)] bg-teal-500 px-4 py-2.5 text-center font-black text-sm uppercase text-white"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-btn border-[3px] border-[var(--hard-border)] bg-teal-500 px-4 py-2.5 text-center font-black text-sm uppercase text-white"
                >
                  → Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-btn border-[3px] border-[var(--hard-border)] bg-accent-500 px-4 py-2.5 text-center font-black text-sm uppercase text-white"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
