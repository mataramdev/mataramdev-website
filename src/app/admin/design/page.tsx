import type { ReactNode } from "react";
import Button from "@/components/ui/Button";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";

export const metadata = {
  title: "Kit Design — Mataram Dev",
  description:
    "Pratinjau token, tipografi, dan komponen dasar sebelum dipakai di halaman.",
};

/**
 * Halaman pratinjau (admin-only, ada di bawah /admin/layout.tsx yang menjaga
 * login + role). Tujuannya satu: bisa melihat token & komponen tanpa menyentuh
 * halaman yang sudah ada — Task 8.6 tahap 1.
 *
 * Helper di bawah sengaja lokal di file ini, bukan komponen yang diekspor.
 */

const ACCENT: [number, string][] = [
  [50, "#fcf8f8"],
  [100, "#faebeb"],
  [200, "#f8d0d0"],
  [300, "#faaeae"],
  [400, "#fd8585"],
  [500, "#ff4040"],
  [600, "#ff1313"],
  [700, "#e20303"],
  [800, "#b30606"],
  [900, "#8b0707"],
  [950, "#5f0707"],
];

const TEAL: [number, string][] = [
  [50, "#f2f9f9"],
  [100, "#d9f1f3"],
  [200, "#a6e7ec"],
  [300, "#66e0eb"],
  [400, "#19d9eb"],
  [500, "#086c75"],
  [600, "#075d65"],
  [700, "#074d53"],
  [800, "#073d42"],
  [900, "#063033"],
  [950, "#052123"],
];

const SURFACES: { token: string; light: string; dark: string; note: string }[] =
  [
    { token: "--background", light: "#ffffff", dark: "#171717", note: "body" },
    { token: "--surface", light: "#f3f3f3", dark: "#0a0a0a", note: "section" },
    {
      token: "--surface-2",
      light: "#ffffff",
      dark: "#12121e",
      note: "kartu",
    },
    {
      token: "--muted",
      light: "#6b7280",
      dark: "#858585",
      note: "teks sekunder (light belum terukur)",
    },
    { token: "--line", light: "#e4e4e7", dark: "#3f3f46", note: "border" },
    {
      token: "--hard-shadow",
      light: "#171717",
      dark: "#000000",
      note: "bayangan offset",
    },
  ];

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400">
          {title}
        </h2>
        {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Swatch({
  name,
  hex,
  className = "",
}: {
  name: string;
  hex: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div
        className="h-16 w-full border-2 border-[var(--hard-border)]"
        style={{ backgroundColor: hex }}
      />
      <p className="mt-1 font-mono text-[11px] leading-tight">{name}</p>
      <p className="font-mono text-[11px] text-muted">{hex}</p>
    </div>
  );
}

export default function DesignKitPage() {
  const variants: { label: string; value: Parameters<typeof Badge>[0]["variant"] }[] = [
    { label: "neutral", value: "neutral" },
    { label: "accent", value: "accent" },
    { label: "teal", value: "teal" },
    { label: "success", value: "success" },
    { label: "warning", value: "warning" },
    { label: "danger", value: "danger" },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight">
          Kit Design
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Token + komponen dasar (Task 8.6 tahap 1). Halaman lain <b>belum</b>
          disentuh — kelas <code className="font-mono">blue-*</code> di seluruh
          src masih dipertahankan sampai hasilnya disetujui. Ganti-ganti
          sekarang aman: semuanya berpusat di{" "}
          <code className="font-mono">src/app/globals.css</code> dan{" "}
          <code className="font-mono">src/components/ui/</code>.
        </p>
      </div>

      <Section
        title="Tipografi"
        hint="Archivo (wght 100-900) untuk judul & body, Space Mono untuk label/meta. Self-host lewat next/font — ganti di src/app/layout.tsx."
      >
        <div className="space-y-2 border-2 border-[var(--hard-border)] p-5">
          <p className="text-5xl font-black uppercase leading-none tracking-tight">
            Judul H1
          </p>
          <p className="text-3xl font-extrabold uppercase tracking-tight">
            Judul H2
          </p>
          <p className="text-xl font-bold">Judul H3</p>
          <p className="text-base">
            Body — cepat, kasar, jujur. Paragraf memakai berat 400 dengan
            tinggi baris nyaman untuk membaca.
          </p>
          <p className="text-sm text-muted">Small / teks sekunder.</p>
          <p className="font-mono text-xs uppercase tracking-widest">
            Label mono · status · kode
          </p>
        </div>
      </Section>

      <Section
        title="Warna aksen"
        hint="Basis #ff4040 (dipilih pemilik produk) — dihitung dari ui_design_canva/Home.png."
      >
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-11">
          {ACCENT.map(([step, hex]) => (
            <Swatch key={step} name={`accent-${step}`} hex={hex} />
          ))}
        </div>
      </Section>

      <Section
        title="Warna sekunder"
        hint="Basis #086c75 (terukur dari mockup) — menggantikan palet teal bawaan Tailwind."
      >
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-11">
          {TEAL.map(([step, hex]) => (
            <Swatch key={step} name={`teal-${step}`} hex={hex} />
          ))}
        </div>
      </Section>

      <Section
        title="Permukaan (ikut mode terang/gelap)"
        hint="Nilai di bawah adalah pasangan terang/gelap; token-nya memakai var(), jadi utilitas ikut berganti saat tema diganti."
      >
        <div className="overflow-x-auto border-2 border-[var(--hard-border)]">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b-2 border-[var(--hard-border)] bg-surface">
                <th className="p-3 uppercase">token</th>
                <th className="p-3 uppercase">terang</th>
                <th className="p-3 uppercase">gelap</th>
                <th className="p-3 uppercase">peran</th>
              </tr>
            </thead>
            <tbody>
              {SURFACES.map((row) => (
                <tr key={row.token} className="border-b border-line last:border-0">
                  <td className="p-3">{row.token}</td>
                  <td className="p-3">
                    <span
                      className="mr-2 inline-block h-3 w-3 border border-[var(--hard-border)] align-middle"
                      style={{ backgroundColor: row.light }}
                    />
                    {row.light}
                  </td>
                  <td className="p-3">
                    <span
                      className="mr-2 inline-block h-3 w-3 border border-[var(--hard-border)] align-middle"
                      style={{ backgroundColor: row.dark }}
                    />
                    {row.dark}
                  </td>
                  <td className="p-3 text-muted">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Button"
        hint="4 varian × 3 ukuran, plus state loading/disabled dan versi tanpa bayangan keras."
      >
        <div className="space-y-4 border-2 border-[var(--hard-border)] p-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button loading>Menyimpan…</Button>
            <Button disabled>Disabled</Button>
            <Button hard={false} variant="secondary">
              Tanpa bayangan
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Badge" hint="Sudut tajam, huruf kapital, font mono.">
        <div className="flex flex-wrap gap-3 border-2 border-[var(--hard-border)] p-5">
          {variants.map((v) => (
            <Badge key={v.label} variant={v.value as BadgeVariant}>
              {v.label}
            </Badge>
          ))}
        </div>
      </Section>

      <Section
        title="Card"
        hint="Bayangan offset padat; `interactive` menggeser kartu saat hover, bukan memblur."
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <Card>
            <Badge variant="accent">default</Badge>
            <p className="mt-3 font-bold uppercase">Kartu biasa</p>
            <p className="mt-1 text-sm text-muted">
              Permukaan kartu dengan bayangan keras.
            </p>
          </Card>
          <Card tone="muted" interactive>
            <Badge variant="teal">interactive</Badge>
            <p className="mt-3 font-bold uppercase">Arahkan kursor</p>
            <p className="mt-1 text-sm text-muted">
              Naik 2px dan bayangannya melebar saat hover.
            </p>
          </Card>
          <Card tone="accent">
            <Badge variant="neutral">accent tone</Badge>
            <p className="mt-3 font-bold uppercase">Blok aksen</p>
            <p className="mt-1 text-sm opacity-90">
              Untuk CTA atau kutipan yang harus menonjol.
            </p>
          </Card>
        </div>
      </Section>

      <Section title="Yang belum diputuskan">
        <ul className="list-inside list-disc space-y-1 text-sm text-muted">
          <li>
            Radius — komponen di atas memakai <code className="font-mono">rounded-none</code>{" "}
            (brutalist); kalau mau lebih lunak, ubah token-nya sekali.
          </li>
          <li>
            Pergantian <code className="font-mono">blue-*</code> →{" "}
            <code className="font-mono">accent-*</code> di seluruh halaman (313
            pemakaian) — tahap berikutnya.
          </li>
          <li>
            Grid kartu &amp; jarak antar section untuk mobile (mockup tidak
            punya versi mobile).
          </li>
        </ul>
      </Section>
    </div>
  );
}
