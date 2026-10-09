import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Icon, { type IconName } from "@/components/ui/icons";
import {
  BTN_RED,
  BTN_WHITE,
  CONTAINER,
  HARD_CARD,
  NEO_BADGE,
} from "@/components/ui/brutalist";

export const metadata = {
  title: "Tentang — Mataram Dev",
  description:
    "Tentang komunitas Mataram Dev: siapa kami, apa yang kami kerjakan, dan di mana kami berkumpul.",
};

/** Hitungan yang ditampilkan di kartu statistik. */
function buildStats(counts: {
  members: number;
  events: number;
  projects: number;
  posts: number;
}) {
  return [
    { label: "Anggota", value: counts.members, icon: "users" as IconName },
    { label: "Event", value: counts.events, icon: "calendar" as IconName },
    { label: "Proyek", value: counts.projects, icon: "rocket" as IconName },
    { label: "Artikel", value: counts.posts, icon: "pen" as IconName },
  ];
}

export default async function AboutPage() {
  const supabase = await createClient();

  // Semua query jalan paralel: satu halaman ini butuh data pengaturan plus
  // empat hitungan, dan tidak ada satu pun yang bergantung pada hasil lainnya.
  const [settingsResult, membersCount, eventsCount, projectsCount, postsCount] =
    await Promise.all([
      supabase
        .from("community_settings")
        .select("name, description, address, maps_location")
        .limit(1)
        .maybeSingle(),
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved"),
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
    ]);

  // Database bermasalah harus muncul sebagai error, bukan sebagai angka 0 atau
  // teks default — sama seperti halaman publik lain (lihat PROGRESS Phase 8).
  const failure = [
    settingsResult,
    membersCount,
    eventsCount,
    projectsCount,
    postsCount,
  ].find((result) => result.error);

  if (failure?.error) {
    throw new Error(`Gagal mengambil data komunitas: ${failure.error.message}`);
  }

  const settings = settingsResult.data;
  const communityName = settings?.name || "Mataram Dev";
  const communityDesc =
    settings?.description ||
    "Platform komunitas developer & designer Kota Mataram, NTB.";

  const stats = buildStats({
    members: membersCount.count ?? 0,
    events: eventsCount.count ?? 0,
    projects: projectsCount.count ?? 0,
    posts: postsCount.count ?? 0,
  });

  // Catatan: tabel `activities` sengaja belum ditampilkan di sini. Belum ada
  // UI admin untuk mengisinya, jadi section itu akan selalu kosong —
  // keputusannya dicatat di PROGRESS Phase 8.1.

  return (
    <div className="flex flex-col bg-background">
      {/* Hero */}
      <section className="border-b-[3px] border-[var(--hard-border)] bg-brand-yellow py-16 text-black sm:py-20 dark:bg-teal-500 dark:text-white">
        <div className={CONTAINER}>
          <span className={`${NEO_BADGE} bg-black text-white`}>
            {communityName} • Nusa Tenggara Barat
          </span>
          <h1 className="mt-5 font-black uppercase leading-none text-4xl sm:text-5xl lg:text-6xl">
            Tentang {communityName}
          </h1>
          <p className="mt-6 max-w-[60ch] text-lg leading-snug sm:text-xl">
            {communityDesc}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/register" className={BTN_RED}>
              Bergabung Sekarang →
            </Link>
            <Link href="/event" className={BTN_WHITE}>
              Lihat Event
            </Link>
          </div>
        </div>
      </section>

      {/* Statistik */}
      <section className="py-16 sm:py-24">
        <div className={CONTAINER}>
          <h2 className="font-black uppercase leading-none text-3xl sm:text-4xl lg:text-5xl">
            Komunitas dalam Angka
          </h2>
          <p className="mt-3 max-w-2xl text-base text-muted">
            Dihitung langsung dari data yang ada di situs ini — bukan angka
            perkiraan.
          </p>

          <dl className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`${HARD_CARD} bg-surface-2 p-5`}
              >
                <span
                  aria-hidden="true"
                  className="flex size-10 items-center justify-center border-[3px] border-[var(--hard-border)] bg-brand-yellow text-black"
                >
                  <Icon name={stat.icon} className="size-5" />
                </span>
                <dd className="mt-2 font-black text-4xl text-accent-500">
                  {stat.value}
                </dd>
                <dt className="mt-1 font-mono text-xs uppercase text-muted">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Lokasi */}
      {settings?.address && (
        <section className="border-y-[3px] border-[var(--hard-border)] bg-brand-navy py-16 text-white sm:py-20">
          <div className={`${CONTAINER} text-center`}>
            <h2 className="font-black uppercase leading-none text-3xl sm:text-4xl">
              Lokasi Kami
            </h2>
            <p className="mt-3 text-base text-white/75">{settings.address}</p>
            {settings.maps_location && (
              <div className="mx-auto mt-8 max-w-[816px] border-[3px] border-[var(--hard-border)] shadow-[6px_6px_0_0_var(--hard-shadow)]">
                <iframe
                  src={settings.maps_location}
                  width="100%"
                  height="350"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Kontribusi */}
      <section className="py-16 sm:py-24">
        <div className={CONTAINER}>
          <h2 className="font-black uppercase leading-none text-3xl sm:text-4xl lg:text-5xl">
            Mau ikut berkontribusi?
          </h2>
          <p className="mt-3 max-w-2xl text-base text-muted">
            Ikut event, tulis artikel, atau kirim proyekmu ke showcase komunitas
            — semuanya bisa dilakukan setelah punya akun.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/proyek"
              className="font-black uppercase text-sm text-accent-500"
            >
              Lihat proyek anggota →
            </Link>
            <Link
              href="/artikel"
              className="font-black uppercase text-sm text-accent-500"
            >
              Baca artikel →
            </Link>
            <Link
              href="/resource"
              className="font-black uppercase text-sm text-accent-500"
            >
              Unduh resource gratis →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
