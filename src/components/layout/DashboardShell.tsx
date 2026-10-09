"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import Icon from "@/components/ui/icons";
import ThemeToggle from "./ThemeToggle";
import { logout } from "@/lib/actions/auth";
import type { SidebarItem, SidebarSection } from "@/lib/dashboardNav";

/**
 * Kerangka dashboard bergaya sidebar — dipakai bareng oleh panel admin dan
 * dashboard member.
 *
 * Sebelumnya tiap panel cuma punya satu baris tombol mendatar di atas halaman
 * (atau, untuk member, tidak ada navigasi sama sekali), sehingga halaman admin
 * hanya bisa dibuka kalau URL-nya dihafal. Sidebar adalah pola yang diharapkan
 * orang dari dashboard: semua tujuan terlihat sekaligus, satu item ditandai
 * aktif, dan di layar sempit ia jadi drawer supaya tidak mendorong konten.
 *
 * Modul ini klien karena butuh `usePathname` (penanda aktif) dan state drawer.
 * Datanya (menu, identitas) dikirim dari layout server sebagai props, jadi
 * tidak ada fetch dari browser.
 */

interface DashboardShellProps {
  /** Lockup brand (mark + wordmark) yang dirender di layout server. */
  brand: ReactNode;
  /** Tujuan klik brand — halaman publik. */
  brandHref?: string;
  /** Label panel di breadcrumb header: "Admin" atau "Dashboard". */
  rootLabel: string;
  sections: SidebarSection[];
  user: { name: string; email: string; role: "admin" | "contributor" };
  children: ReactNode;
}

/**
 * Item yang aktif = href paling spesifik yang cocok. Ini yang membuat
 * `/admin` tidak ikut menyala saat kita berada di `/admin/event` — perbandingan
 * "startsWith" saja tidak bisa membedakan keduanya.
 */
function useActiveItem(items: SidebarItem[]): SidebarItem | null {
  const pathname = usePathname();
  const matches = items.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return matches.sort((a, b) => b.href.length - a.href.length)[0] ?? null;
}

function SidebarLink({
  item,
  active,
  onNavigate,
}: {
  item: SidebarItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-btn border-[3px] px-3 py-2.5 text-sm font-bold transition-colors ${
        active
          ? "border-[var(--hard-border)] bg-brand-ink text-white shadow-[3px_3px_0_0_var(--hard-shadow)]"
          : "border-transparent text-foreground hover:border-[var(--hard-border)] hover:bg-surface-3"
      }`}
    >
      <Icon name={item.icon} className="size-4 shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {typeof item.badge === "number" && item.badge > 0 && (
        <span className="border-2 border-[var(--hard-border)] bg-brand-gold px-1.5 font-mono text-[10px] font-bold text-black">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function SidebarBody({
  sections,
  activeHref,
  onNavigate,
  brand,
  brandHref = "/",
  footer,
}: {
  sections: SidebarSection[];
  activeHref: string | null;
  onNavigate?: () => void;
  brand: ReactNode;
  brandHref?: string;
  footer: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-5">
      <Link
        href={brandHref}
        onClick={onNavigate}
        className="flex items-center gap-2.5"
      >
        {brand}
      </Link>

      <nav className="flex flex-1 flex-col gap-6">
        {sections.map((section, index) => (
          <div key={section.heading ?? index} className="flex flex-col gap-1.5">
            {section.heading && (
              <p className="px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                {section.heading}
              </p>
            )}
            {section.items.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                active={item.href === activeHref}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </nav>

      {footer}
    </div>
  );
}

export default function DashboardShell({
  brand,
  brandHref,
  rootLabel,
  sections,
  user,
  children,
}: DashboardShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navItems = sections.flatMap((s) => s.items);
  const activeItem = useActiveItem(navItems);
  const activeHref = activeItem?.href ?? null;

  // Drawer dikunci ke viewport: tanpa ini halaman di belakangnya ikut
  // ter-scroll sementara menu tetap diam.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  const footer = (
    <div className="flex flex-col gap-3 border-t-[3px] border-[var(--hard-border)] pt-4">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border-[3px] border-[var(--hard-border)] bg-surface-3 font-mono text-xs font-bold uppercase">
          {user.name.slice(0, 2)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold">{user.name}</span>
          <span className="block truncate font-mono text-[11px] text-muted">
            {user.role === "admin" ? "Admin" : "Contributor"}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <form action={logout} className="flex-1">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-btn border-[3px] border-[var(--hard-border)] bg-surface px-3 py-2 text-xs font-bold uppercase transition-colors hover:bg-surface-3"
          >
            <Icon name="arrowRight" className="size-3.5" />
            Keluar
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Sidebar tetap — hanya di layar lebar. */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r-[3px] border-[var(--hard-border)] bg-surface-2 lg:block">
        <SidebarBody
          sections={sections}
          activeHref={activeHref}
          brand={brand}
          brandHref={brandHref}
          footer={footer}
        />
      </aside>

      {/* Drawer untuk layar sempit. */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r-[3px] border-[var(--hard-border)] bg-surface-2">
            <SidebarBody
              sections={sections}
              activeHref={activeHref}
              onNavigate={() => setDrawerOpen(false)}
              brand={brand}
              brandHref={brandHref}
              footer={footer}
            />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b-[3px] border-[var(--hard-border)] bg-surface-2">
          <div className="flex items-center gap-3 px-4 py-4 sm:px-8">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka menu"
              aria-expanded={drawerOpen}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-btn border-[3px] border-[var(--hard-border)] bg-surface lg:hidden"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb, bukan judul halaman: judul aslinya sudah dirender
                oleh masing-masing halaman, jadi ini penunjuk posisi saja. */}
            <nav
              aria-label="Breadcrumb"
              className="min-w-0 flex-1 font-mono text-xs font-bold uppercase tracking-wide"
            >
              <span className="text-muted">{rootLabel}</span>
              {activeItem && (
                <span className="text-foreground"> / {activeItem.label}</span>
              )}
            </nav>

            <Link
              href="/"
              className="hidden shrink-0 items-center gap-1.5 rounded-btn border-[3px] border-[var(--hard-border)] bg-surface px-3 py-2 text-xs font-bold uppercase transition-colors hover:bg-surface-3 sm:inline-flex"
            >
              <Icon name="external" className="size-3.5" />
              Lihat situs
            </Link>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
