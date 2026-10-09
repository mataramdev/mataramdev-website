import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Icon, { type IconName } from "@/components/ui/icons";
import { BTN_SM_DARK, HARD_CARD, NEO_BADGE } from "@/components/ui/brutalist";

export const metadata = {
  title: "Dashboard",
};

/**
 * Halaman awal setelah login (untuk non-admin).
 *
 * Sebelum ini tidak ada halaman ini: setelah masuk, pengguna dilempar ke
 * landing page publik dan harus mencari sendiri tautan Profil / Proyek Saya /
 * Artikel Saya. Sekarang halaman ini yang jadi titik awal, sekaligus
 * menunjukkan status karya sendiri tanpa harus membuka tiap halaman.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Layout sudah memastikan sesinya ada; ini hanya untuk tipe data.
  if (!user) return null;

  const [profileResult, ownProjects, ownPosts] = await Promise.all([
    supabase
      .from("users")
      .select("fullname, username, bio, image_url, role")
      .eq("id", user.id)
      .single(),
    supabase
      .from("projects")
      .select("status")
      .eq("created_by", user.id),
    supabase.from("posts").select("status").eq("author_id", user.id),
  ]);

  const profile = profileResult.data;
  const isAdmin = profile?.role === "admin";

  const projects = ownProjects.data ?? [];
  const posts = ownPosts.data ?? [];

  const pendingProjects = projects.filter((p) => p.status === "pending").length;
  const approvedProjects = projects.filter((p) => p.status === "approved").length;
  const drafts = posts.filter((p) => p.status === "draft").length;
  const published = posts.filter((p) => p.status === "published").length;

  // Profil dianggap lengkap kalau hal-hal yang tampil publik (direktori
  // /anggota) sudah terisi. Dipakai untuk mengingatkan, bukan memblokir.
  const profileMissing = [
    !profile?.username && "username",
    !profile?.bio && "bio",
    !profile?.image_url && "foto profil",
  ].filter(Boolean) as string[];

  const name = profile?.fullname || user.email?.split("@")[0] || "Anggota";

  const tiles: { label: string; value: number; note?: string; href: string; icon: IconName }[] = [
    {
      label: "Proyek",
      value: projects.length,
      note: pendingProjects > 0 ? `${pendingProjects} menunggu moderasi` : undefined,
      href: "/proyek-saya",
      icon: "package",
    },
    {
      label: "Artikel",
      value: posts.length,
      note: drafts > 0 ? `${drafts} masih draf` : undefined,
      href: "/artikel-saya",
      icon: "pen",
    },
    {
      label: "Proyek tayang",
      value: approvedProjects,
      href: "/proyek-saya",
      icon: "rocket",
    },
    {
      label: "Artikel terbit",
      value: published,
      href: "/artikel-saya",
      icon: "book",
    },
  ];

  return (
    <div className="space-y-8">
      <div className={`${HARD_CARD} bg-surface-2 p-6`}>
        <span className={`${NEO_BADGE} bg-teal-500 text-white`}>
          {isAdmin ? "Admin" : "Anggota"}
        </span>
        <h1 className="mt-4 font-black uppercase leading-none text-2xl">
          Halo, {name}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Dari sini kamu bisa mengelola profil, proyek, dan artikel yang kamu
          kirim ke komunitas.
        </p>
      </div>

      {profileMissing.length > 0 && (
        <div className={`${HARD_CARD} flex flex-wrap items-center gap-4 bg-brand-yellow p-5 text-black`}>
          <Icon name="user" className="size-6 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm">
              Profilmu belum lengkap: {profileMissing.join(", ")}.
            </p>
            <p className="mt-0.5 text-xs">
              Profil yang lengkap memudahkan orang lain mengenalimu di direktori
              anggota.
            </p>
          </div>
          <Link href="/profil" className={BTN_SM_DARK}>
            Lengkapi profil
          </Link>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
          Karyamu
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className={`${HARD_CARD} flex flex-col gap-2 bg-surface-2 p-5 transition-transform hover:-translate-y-0.5`}
            >
              <Icon name={tile.icon} className="size-5 text-muted" />
              <span className="font-black text-3xl leading-none">
                {tile.value}
              </span>
              <span className="text-xs text-muted">{tile.label}</span>
              {tile.note && (
                <span className="font-mono text-[10px] font-bold uppercase text-accent-600">
                  {tile.note}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
          Mulai dari sini
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/proyek/baru"
            className={`${HARD_CARD} bg-surface-2 p-5 transition-transform hover:-translate-y-0.5`}
          >
            <Icon name="rocket" className="size-6" />
            <p className="mt-3 font-black uppercase text-sm">Kirim proyek</p>
            <p className="mt-1 text-xs text-muted">
              Bagikan proyekmu; admin akan meninjau sebelum tayang.
            </p>
          </Link>

          <Link
            href="/artikel/baru"
            className={`${HARD_CARD} bg-surface-2 p-5 transition-transform hover:-translate-y-0.5`}
          >
            <Icon name="book" className="size-6" />
            <p className="mt-3 font-black uppercase text-sm">Tulis artikel</p>
            <p className="mt-1 text-xs text-muted">
              Simpan sebagai draf dulu, terbitkan kalau sudah siap.
            </p>
          </Link>
        </div>
      </section>

      {isAdmin && (
        <section className={`${HARD_CARD} flex flex-wrap items-center gap-4 bg-brand-purple p-5 text-white`}>
          <Icon name="shield" className="size-6 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm">Kamu admin komunitas.</p>
            <p className="mt-0.5 text-xs">
              Persetujuan pendaftar, moderasi proyek, dan pengaturan komunitas ada
              di panel admin.
            </p>
          </div>
          <Link
            href="/admin"
            className={`${BTN_SM_DARK} bg-brand-gold text-black`}
          >
            Buka panel admin
          </Link>
        </section>
      )}
    </div>
  );
}
