import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/seo";
import Icon, { type IconName } from "@/components/ui/icons";
import { HARD_CARD, NEO_BADGE } from "@/components/ui/brutalist";

export const metadata = {
  title: "Ringkasan Admin",
};

/**
 * Halaman awal panel admin.
 *
 * Sebelum ini `/admin` tidak punya halaman sama sekali: setelah login, admin
 * harus mengetik `/admin/event`, `/admin/users`, dst. di address bar untuk
 * masuk ke panelnya. Halaman ini yang menjadi pintu masuknya — menampilkan apa
 * yang sedang menunggu tindakan, ringkasan isi komunitas, dan pintasan.
 */
export default async function AdminOverviewPage() {
  const supabase = await createClient();

  // Satu gelombang permintaan paralel — halaman ini yang pertama dibuka admin,
  // jadi total waktu tunggunya harus sependek mungkin. `head: true` berarti
  // yang dikirim balik hanya jumlahnya, bukan barisnya.
  const [
    pendingUsers,
    totalUsers,
    pendingProjects,
    approvedProjects,
    ongoingEvents,
    publishedPosts,
    draftPosts,
    resources,
    faqs,
    stacks,
  ] = await Promise.all([
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "pending"),
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .in("status", ["upcoming", "ongoing"]),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase.from("free_resources").select("id", { count: "exact", head: true }),
    supabase.from("faq").select("id", { count: "exact", head: true }),
    supabase.from("stacks").select("id", { count: "exact", head: true }),
  ]);

  const n = (result: { count: number | null }) => result.count ?? 0;

  const waitingUsers = n(pendingUsers);
  const waitingProjects = n(pendingProjects);

  const siteUrl = getSiteUrl().toString().replace(/\/$/, "");

  const contentStats: { label: string; value: number; href: string; icon: IconName }[] = [
    { label: "Proyek tayang", value: n(approvedProjects), href: "/admin/proyek", icon: "package" },
    { label: "Event aktif", value: n(ongoingEvents), href: "/admin/event", icon: "calendar" },
    // Artikel tidak punya halaman admin (post_status cuma draft/published),
    // jadi kartunya menuju daftar publik dan daftar draf penulis.
    { label: "Artikel terbit", value: n(publishedPosts), href: "/artikel", icon: "book" },
    { label: "Draf artikel", value: n(draftPosts), href: "/artikel-saya", icon: "pen" },
    { label: "Resource", value: n(resources), href: "/admin/resource", icon: "download" },
    { label: "FAQ", value: n(faqs), href: "/admin/faq", icon: "chat" },
    { label: "Stack", value: n(stacks), href: "/admin/stack", icon: "layers" },
    { label: "Anggota", value: n(totalUsers), href: "/admin/users", icon: "users" },
  ];

  const quickLinks: { label: string; description: string; href: string; icon: IconName }[] = [
    {
      label: "Kelola Event",
      description: "Buat, ubah, dan atur pembicara event.",
      href: "/admin/event",
      icon: "calendar",
    },
    {
      label: "Moderasi Proyek",
      description: "Setujui atau tolak kiriman proyek anggota.",
      href: "/admin/proyek",
      icon: "package",
    },
    {
      label: "Pengguna",
      description: "Setujui pendaftar, atur role, aktif/nonaktifkan.",
      href: "/admin/users",
      icon: "users",
    },
    {
      label: "Pengaturan",
      description: "Nama komunitas, logo, alamat, dan SEO.",
      href: "/admin/pengaturan",
      icon: "target",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-black uppercase leading-none text-2xl">Panel Admin</h1>
        <p className="mt-1 text-sm text-muted">
          Ringkasan komunitas dan hal-hal yang menunggu tindakanmu.
        </p>
      </div>

      {/* Perlu tindakan ─────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
          Perlu tindakan
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <ActionCard
            icon="users"
            label="Pendaftar menunggu persetujuan"
            count={waitingUsers}
            href="/admin/users"
            cta="Tinjau pendaftar"
            emptyText="Tidak ada pendaftar yang menunggu."
          />
          <ActionCard
            icon="package"
            label="Proyek menunggu moderasi"
            count={waitingProjects}
            href="/admin/proyek"
            cta="Buka moderasi"
            emptyText="Semua kiriman proyek sudah ditinjau."
          />
        </div>
      </section>

      {/* Ringkasan konten ───────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
          Ringkasan konten
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {contentStats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className={`${HARD_CARD} flex items-center gap-3 bg-surface-2 p-4 transition-transform hover:-translate-y-0.5`}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-3">
                <Icon name={stat.icon} className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-black text-2xl leading-none">
                  {stat.value}
                </span>
                <span className="mt-1 block truncate text-xs text-muted">
                  {stat.label}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Akses cepat ────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
          Akses cepat
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${HARD_CARD} bg-surface-2 p-5 transition-transform hover:-translate-y-0.5`}
            >
              <Icon name={link.icon} className="size-6" />
              <p className="mt-3 font-black uppercase text-sm">{link.label}</p>
              <p className="mt-1 text-xs text-muted">{link.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Catatan konfigurasi email ──────────────────────── */}
      <section className={`${HARD_CARD} bg-surface-2 p-6`}>
        <span className={`${NEO_BADGE} bg-brand-gold text-black`}>
          Langkah manual
        </span>
        <h2 className="mt-4 font-black uppercase leading-none text-lg">
          Konfigurasi tautan email di Supabase
        </h2>
        <p className="mt-2 text-sm text-muted">
          Supabase hanya memakai alamat yang dikirim aplikasi kalau alamatnya
          ada di daftar izin. Kalau tidak, tautan verifikasi dilempar ke{" "}
          <strong className="font-bold text-foreground">Site URL</strong> project
          — inilah kenapa tautannya bisa mendarat di halaman login deployment
          lama, bukan di situs ini. Perbaikannya di dashboard, bukan di kode:
        </p>
        <ol className="mt-4 space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="font-mono text-xs font-bold text-muted">01</span>
            <span>
              Buka{" "}
              <strong className="font-bold">
                Authentication → URL Configuration
              </strong>
              .
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-xs font-bold text-muted">02</span>
            <span>
              Isi <strong className="font-bold">Site URL</strong> dengan domain
              produksi situs ini, bukan URL deploy lama.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-xs font-bold text-muted">03</span>
            <span>
              Tambahkan ke{" "}
              <strong className="font-bold">Redirect URLs</strong>:{" "}
              {/* Nilainya masuk template literal: `/**` yang ditulis sebagai
                  teks anak JSX dibaca ESLint sebagai awal komentar. */}
              <code className="rounded border-2 border-[var(--hard-border)] bg-surface-3 px-1.5 font-mono text-xs">
                {`${siteUrl}/**`}
              </code>{" "}
              dan{" "}
              <code className="rounded border-2 border-[var(--hard-border)] bg-surface-3 px-1.5 font-mono text-xs">
                {"http://localhost:3000/**"}
              </code>
            </span>
          </li>
        </ol>
        <p className="mt-4 text-xs text-muted">
          Alamat yang dipakai situs ini sekarang:{" "}
          <span className="font-mono text-foreground">{siteUrl}</span>. Tautan
          verifikasi sendiri selalu dibangun dari origin yang benar-benar dipakai
          saat mendaftar, jadi domain baru langsung bekerja begitu diizinkan.
        </p>
      </section>
    </div>
  );
}

function ActionCard({
  icon,
  label,
  count,
  href,
  cta,
  emptyText,
}: {
  icon: IconName;
  label: string;
  count: number;
  href: string;
  cta: string;
  emptyText: string;
}) {
  const hasWork = count > 0;

  return (
    <div
      className={`${HARD_CARD} flex flex-col gap-4 p-6 ${
        hasWork ? "bg-brand-gold text-black" : "bg-surface-2"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 text-foreground">
          <Icon name={icon} className="size-5" />
        </span>
        <span className="font-black text-3xl leading-none">{count}</span>
      </div>

      <p className="font-bold text-sm">{label}</p>

      {hasWork ? (
        <Link
          href={href}
          className="inline-flex items-center gap-2 self-start rounded-btn border-[3px] border-[var(--hard-border)] bg-brand-ink px-4 py-2 font-black text-xs uppercase text-white shadow-[3px_3px_0_0_var(--hard-shadow)]"
        >
          {cta}
          <Icon name="arrowRight" className="size-3.5" />
        </Link>
      ) : (
        <p className="inline-flex items-center gap-2 text-xs text-muted">
          <Icon name="check" className="size-3.5" />
          {emptyText}
        </p>
      )}
    </div>
  );
}
