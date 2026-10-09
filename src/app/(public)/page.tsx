import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, oneRelation } from "@/lib/utils";
import { eventStatusLabel } from "@/lib/eventStatus";
import {
  resourceCategoryLabel,
  resourceFallbackIcon,
} from "@/lib/resourceCategory";
import Icon from "@/components/ui/icons";
import { sortFaqRows } from "@/lib/faq";
import { sortByOrder } from "@/lib/ordering";
import {
  ArticleCard,
  EventCard,
  ProjectCard,
  type ArticleCardData,
  type EventCardData,
  type ProjectCardData,
} from "@/components/cards";
import {
  BTN_RED,
  BTN_TEAL,
  BTN_WHITE,
  CONTAINER,
  CenterCta,
  FaqItem,
  HARD_CARD,
  SectionEmpty,
  SectionError,
  SectionHeading,
  contributorLabels,
  initials,
  tileTextClass,
  timeRange,
  toSection,
} from "@/components/ui/brutalist";
import HeroSlider, { type HeroSlide } from "@/components/HeroSlider";

/**
 * Halaman depan — neo-brutalist.
 *
 * Sumber desain: `ui_design_canva/html/Mataram Dev — Wadah Kolaborasi Talenta
 * Digital Kota Mataram.html` (export 6 Okt 2026) + peta blok terukur di
 * `docs/DESIGN-BRIEF.md` §4. Warna, radius, dan urutan section mengikuti file
 * itu apa adanya; angka yang dipakai di halaman ini adalah **data asli** dari
 * database, bukan angka contoh di mockup (mis. "500+ Anggota").
 *
 * Aturan gaya yang berlaku di seluruh file:
 * - border/sombra memakai `--hard-border`/`--hard-shadow` supaya versi gelap
 *   tidak berubah jadi hitam-di-atas-hitam;
 * - bidang warna penuh (hero kuning → teal, band resource merah, band artikel
 *   biru muda) ikut desain, dengan pasangan `dark:` dari hasil ukur PNG gelap;
 * - primitif bersama (tombol, kartu, badge, heading section) tinggal di
 *   `src/components/ui/brutalist.tsx` supaya semua halaman memakai ukuran yang
 *   sama (CONVENTIONS §2 & §6).
 */

/** Batas jumlah kartu per section, mengikuti mockup. */
const EVENT_LIMIT = 3;
const PROJECT_LIMIT = 3;
const ARTICLE_LIMIT = 4; // 3 kartu + 1 kartu cerita
const RESOURCE_LIMIT = 8;
const FAQ_LIMIT = 6;

/**
 * Foto komunitas untuk slider hero (berkas di `public/images/events/`,
 * disalin dari `ui_design_canva/asets/images/`). Urutannya tetap supaya
 * dokumentasi & pengujian deterministik.
 */
const HERO_PHOTOS: HeroSlide[] = [
  {
    src: "/images/events/fotobareng.webp",
    alt: "Foto bareng anggota komunitas Mataram Dev",
  },
  {
    src: "/images/events/audiens1.webp",
    alt: "Audiens mengikuti sesi tech talk komunitas",
  },
  {
    src: "/images/events/wfc1.webp",
    alt: "Workshop From Zero bersama anggota Mataram Dev",
  },
  {
    src: "/images/events/networking.webp",
    alt: "Sesi networking antar anggota komunitas",
  },
  {
    src: "/images/events/discussion1.webp",
    alt: "Diskusi ringan antar anggota Mataram Dev",
  },
];

interface SettingsRow {
  name: string | null;
  description: string | null;
  address: string | null;
  maps_location: string | null;
}

interface EventRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  status: string;
  start_time: string | null;
  end_time: string | null;
  location_name: string | null;
}

interface ProjectRow {
  id: string;
  slug: string;
  name: string;
  content: string | null;
  image_url: string | null;
  project_stacks: { stacks: { name: string } | null }[] | null;
  project_contributors: {
    users: { username: string | null; fullname: string | null } | null;
  }[] | null;
}

interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  category: string | null;
  published_date: string | null;
  users: { fullname: string | null; username: string | null } | null;
}

interface ResourceRow {
  id: string;
  name: string;
  icon: string | null;
  category: string;
  download_count: number | null;
}

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  order: number | null;
}

interface ActivityRow {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order: number | null;
}

/** Adaptor baris DB → props kartu bersama (`src/components/cards.tsx`). */
function toEventCard(event: EventRow): EventCardData {
  return {
    slug: event.slug,
    title: event.title,
    excerpt: event.excerpt,
    imageUrl: event.image_url,
    status: event.status,
    startTime: event.start_time,
    endTime: event.end_time,
    locationName: event.location_name,
  };
}

function toProjectCard(project: ProjectRow): ProjectCardData {
  return {
    slug: project.slug,
    name: project.name,
    content: project.content,
    imageUrl: project.image_url,
    stackNames: (project.project_stacks ?? [])
      .map((row) => oneRelation(row.stacks)?.name)
      .filter((name): name is string => Boolean(name)),
    contributors: contributorLabels(project.project_contributors),
  };
}

function ResourceChip({
  resource,
  duplicate = false,
}: {
  resource: ResourceRow;
  duplicate?: boolean;
}) {
  return (
    <a
      href={`/resource/${resource.id}/download`}
      aria-hidden={duplicate || undefined}
      tabIndex={duplicate ? -1 : undefined}
      className="mr-4 flex shrink-0 items-center gap-3 whitespace-nowrap border-[3px] border-[var(--hard-border)] bg-white px-5 py-3 text-black shadow-[4px_4px_0_0_var(--hard-shadow)]"
    >
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center border-2 border-[var(--hard-border)] bg-brand-yellow text-sm"
      >
        {resource.icon ? (
          resource.icon
        ) : (
          <Icon name={resourceFallbackIcon(resource.category)} className="size-5" />
        )}
      </span>
      <span className="font-black text-sm">
        [{resourceCategoryLabel(resource.category)}] {resource.name}
      </span>
      <span className="font-mono text-[11px] text-black/60">
        {resource.download_count ?? 0} unduhan
      </span>
    </a>
  );
}

function toArticleCard(post: PostRow): ArticleCardData {
  const author = post.users ? oneRelation(post.users) : undefined;

  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    imageUrl: post.image_url,
    category: post.category,
    publishedDate: post.published_date,
    authorName: author?.fullname || author?.username || "Anonim",
  };
}

/** Kartu cerita: satu artikel disorot di kartu navy lebar (mockup §13–16). */
function StoryCard({ post }: { post: PostRow }) {
  const author = post.users ? oneRelation(post.users) : undefined;
  const authorName = author?.fullname || author?.username || "Anonim";

  return (
    <article
      className={`${HARD_CARD} mt-6 grid overflow-hidden bg-brand-navy text-white md:grid-cols-[285px_1fr]`}
    >
      <div className="relative min-h-[180px] bg-gradient-to-br from-zinc-600 to-zinc-900">
        {post.image_url && (
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 285px"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-col justify-center gap-3 p-6">
        <h3 className="font-black text-xl">{post.title}</h3>
        {post.excerpt && (
          <p className="max-w-[55ch] text-sm leading-relaxed text-white/70">
            {post.excerpt}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex size-6 items-center justify-center border-2 border-white bg-brand-yellow font-mono text-[10px] font-bold text-black"
            >
              {initials(authorName)}
            </span>
            <span className="font-black text-xs">{authorName}</span>
            {post.published_date && (
              <span className="font-mono text-[11px] text-white/50">
                {formatDate(post.published_date)}
              </span>
            )}
          </span>
          <Link
            href={`/artikel/${post.slug}`}
            className="border-2 border-white px-4 py-1.5 font-black text-xs uppercase text-white"
          >
            Baca Selengkapnya →
          </Link>
        </div>
      </div>
    </article>
  );
}

function ActivityTile({ activity }: { activity: ActivityRow }) {
  return (
    <div
      className="flex min-h-[165px] flex-col gap-3 border border-black/15 p-8"
      style={activity.color ? { backgroundColor: activity.color } : undefined}
    >
      <h3
        className={`font-black uppercase leading-tight text-lg ${tileTextClass(activity.color)}`}
      >
        {activity.icon && (
          <span aria-hidden="true" className="mr-2">
            {activity.icon}
          </span>
        )}
        {activity.name}
      </h3>
      {activity.description && (
        <p className="max-w-[60ch] text-sm leading-relaxed opacity-80">
          {activity.description}
        </p>
      )}
    </div>
  );
}

export default async function Home() {
  const supabase = await createClient();

  // Semua query dijalankan paralel: tidak ada satu pun yang butuh hasil yang
  // lain, jadi menunggunya berurutan cuma menambah waktu muat.
  const [
    settingsResult,
    eventsResult,
    projectsResult,
    postsResult,
    resourcesResult,
    faqResult,
    activitiesResult,
    membersCount,
    eventsCount,
    projectsCount,
  ] = await Promise.all([
    supabase
      .from("community_settings")
      .select("name, description, address, maps_location")
      .limit(1)
      .maybeSingle(),
    // Event yang masih relevan: yang akan datang dan yang sedang berlangsung.
    supabase
      .from("events")
      .select(
        "id, slug, title, excerpt, image_url, status, start_time, end_time, location_name",
      )
      .in("status", ["upcoming", "ongoing"])
      .order("start_time", { ascending: true, nullsFirst: false })
      .limit(EVENT_LIMIT),
    supabase
      .from("projects")
      .select(
        "id, slug, name, content, image_url, project_stacks(stacks(name)), project_contributors(users(username, fullname))",
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(PROJECT_LIMIT),
    supabase
      .from("posts")
      .select(
        "id, slug, title, excerpt, image_url, category, published_date, users(fullname, username)",
      )
      .eq("status", "published")
      .order("published_date", { ascending: false, nullsFirst: false })
      .limit(ARTICLE_LIMIT),
    supabase
      .from("free_resources")
      .select("id, name, icon, category, download_count")
      .order("created_at", { ascending: false })
      .limit(RESOURCE_LIMIT),
    supabase.from("faq").select("id, question, answer, order"),
    // Activities have no dedicated page; the section is landing-only.
    supabase.from("activities").select("id, name, description, icon, color, order"),
    // Angka hero dihitung dari data asli, bukan angka contoh di mockup.
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),
  ]);

  // Nama & deskripsi komunitas tetap punya teks cadangan: halaman depan harus
  // bisa dibuka walau pengaturan belum pernah diisi.
  const settings = settingsResult.data as SettingsRow | null;
  const communityName = settings?.name || "Mataram Dev";
  const communityDesc =
    settings?.description ||
    "Titik temu para developer & designer untuk membangun ekosistem teknologi lokal NTB. Belajar bareng, bangun proyek nyata, dan tumbuh bersama komunitas.";

  const events = toSection<EventRow>(eventsResult);
  const projects = toSection<ProjectRow>(projectsResult);
  const posts = toSection<PostRow>(postsResult);
  const resources = toSection<ResourceRow>(resourcesResult);

  // Urutan FAQ tidak bisa diserahkan ke SQL (kolom `order` boleh null dan boleh
  // kembar), jadi memakai aturan yang sama dengan halaman /faq dan admin.
  const faqSection = toSection<FaqRow>(faqResult);
  const faqItems = faqSection.failed ? [] : sortFaqRows(faqSection.rows).slice(0, FAQ_LIMIT);

  // Activities use the same ordering rules as FAQ (nullable/duplicate `order`).
  const activitiesSection = toSection<ActivityRow>(activitiesResult);
  const activityItems = activitiesSection.failed ? [] : sortByOrder(activitiesSection.rows);

  const heroStats = [
    { label: "Anggota", value: membersCount.count ?? 0 },
    { label: "Event", value: eventsCount.count ?? 0 },
    { label: "Proyek", value: projectsCount.count ?? 0 },
  ];

  const [nearestEvent] = events.rows;
  const nearestRange = nearestEvent
    ? timeRange(nearestEvent.start_time, nearestEvent.end_time)
    : null;

  // Slide pertama = sampul event terdekat (kalau admin sudah mengunggah),
  // dilanjut dokumentasi kegiatan komunitas. Kotak medianya selalu tampil,
  // kartu "Event Terdekat" hanya saat eventnya ada.
  const heroSlides: HeroSlide[] = [
    ...(nearestEvent?.image_url
      ? [
          {
            src: nearestEvent.image_url,
            alt: `Dokumentasi ${nearestEvent.title}`,
          },
        ]
      : []),
    ...HERO_PHOTOS,
  ];
  const articleCards = posts.rows.slice(0, ARTICLE_LIMIT - 1);
  const storyPost = posts.rows[ARTICLE_LIMIT - 1];

  // Dua baris marquee: separuh item per baris, kecepatan & arah beda.
  const resourceRows = (() => {
    if (resources.failed) return [] as ResourceRow[][];
    const half = Math.ceil(resources.rows.length / 2);
    return [resources.rows.slice(0, half), resources.rows.slice(half)].filter(
      (row) => row.length > 0,
    );
  })();

  return (
    <div className="flex flex-col bg-background">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        id="beranda"
        className="border-b-[3px] border-[var(--hard-border)] bg-brand-yellow py-16 text-black sm:py-20 dark:bg-teal-500 dark:text-white"
      >
        <div className={`${CONTAINER} grid gap-10 lg:grid-cols-2 lg:items-start`}>
          <div>
            <span className="inline-block border-2 border-[var(--hard-border)] bg-black px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-white">
              {communityName} • Nusa Tenggara Barat
            </span>

            <h1                  className="mt-5 font-black uppercase leading-none text-4xl sm:text-5xl lg:text-6xl">
              Wadah{" "}
              <span className="inline-block rounded-btn border-2 border-[var(--hard-border)] bg-brand-blue px-2.5 text-white dark:bg-brand-yellow dark:text-black">
                Kolaborasi
              </span>{" "}
              Talenta Digital Kota Mataram
            </h1>

            <p className="mt-6 max-w-[46ch] text-lg leading-snug sm:text-xl">
              {communityDesc}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/event" className={BTN_WHITE}>
                Lihat Event
              </Link>
              <Link href="/register" className={BTN_RED}>
                Gabung Sekarang →
              </Link>
            </div>

            <ul className="mt-11 flex flex-wrap gap-4">
              {heroStats.map((stat) => (
                <li
                  key={stat.label}
                  className={`${HARD_CARD} min-w-[150px] bg-white px-4 py-3 text-black dark:bg-surface-2 dark:text-white`}
                >
                  <b className="block font-black text-3xl text-accent-500">
                    {stat.value}
                  </b>
                  <span className="text-base">{stat.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <HeroSlider
              slides={heroSlides}
              badge={
                nearestEvent ? eventStatusLabel(nearestEvent.status) : null
              }
            />

            {nearestEvent && (
              <div className="absolute -bottom-6 -left-2 hidden w-[224px] rotate-3 border-[3px] border-[var(--hard-border)] bg-brand-yellow p-4 font-mono text-black shadow-[6px_6px_0_0_var(--hard-shadow)] lg:block">
                <span className="block text-[11px] font-bold uppercase">
                  Event Terdekat:
                </span>
                <span className="mt-1 block text-base font-bold">
                  {nearestEvent.title}
                </span>
                <span className="mt-2 block text-sm">
                  {nearestEvent.start_time && formatDate(nearestEvent.start_time)}
                  {nearestRange && (
                    <>
                      <br />
                      {nearestRange}
                    </>
                  )}
                  {nearestEvent.location_name && (
                    <>
                      <br />
                      {nearestEvent.location_name}
                    </>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Event ────────────────────────────────────────────── */}
      <section id="event" className="scroll-mt-24 py-16 sm:py-24">
        <div className={CONTAINER}>
          <SectionHeading
            badge="Daftar Event"
            title="Event Komunitas"
            description="Kegiatan komunitas yang sedang berlangsung dan yang sebentar lagi datang."
          />

          {events.failed ? (
            <SectionError what="event" />
          ) : events.rows.length === 0 ? (
            <SectionEmpty>
              Belum ada event yang dijadwalkan. Pantau terus ya!
            </SectionEmpty>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.rows.map((event) => (
                <EventCard key={event.id} event={toEventCard(event)} />
              ))}
            </div>
          )}

          <CenterCta href="/event" label="Lihat Semua Event" tone={BTN_TEAL} />
        </div>
      </section>

      {/* ── Aktivitas ────────────────────────────────────────── */}
      <section
        id="aktivitas"
        className="scroll-mt-24 border-y-[3px] border-[var(--hard-border)] bg-surface-3 py-16 sm:py-24"
      >
        <h2 className="px-5 text-center font-black uppercase leading-none text-3xl sm:px-10 sm:text-4xl lg:text-5xl">
          Aktivitas Komunitas
        </h2>

        {activitiesSection.failed ? (
          <div className={CONTAINER}>
            <SectionError what="aktivitas" />
          </div>
        ) : activityItems.length === 0 ? (
          <div className={CONTAINER}>
            <SectionEmpty>Belum ada aktivitas yang ditulis. Nantikan ya!</SectionEmpty>
          </div>
        ) : (
          <div className="mx-auto mt-10 grid max-w-[1360px] border-[3px] border-[var(--hard-border)] sm:grid-cols-2">
            {activityItems.map((activity) => (
              <ActivityTile key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </section>

      {/* ── Proyek ───────────────────────────────────────────── */}
      <section id="proyek" className="scroll-mt-24 py-16 sm:py-24">
        <div className={CONTAINER}>
          <SectionHeading
            badge="Proyek Unggulan"
            title="Karya Anggota Komunitas"
            description="Karya yang sudah lolos kurasi admin."
          />

          {projects.failed ? (
            <SectionError what="proyek" />
          ) : projects.rows.length === 0 ? (
            <SectionEmpty>
              Belum ada proyek yang tampil. Punyamu bisa jadi yang pertama!
            </SectionEmpty>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.rows.map((project) => (
                <ProjectCard key={project.id} project={toProjectCard(project)} />
              ))}
            </div>
          )}

          <CenterCta href="/proyek" label="Lihat Semua Proyek" tone={BTN_TEAL} />
        </div>
      </section>

      {/* ── Resource ─────────────────────────────────────────── */}
      <section
        id="resource"
        className="scroll-mt-24 border-y-[3px] border-[var(--hard-border)] bg-accent-500 py-14"
      >
        <div className={CONTAINER}>
          <span className="inline-block border-2 border-[var(--hard-border)] bg-black px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-white">
            Open Source
          </span>
          <h2 className="mt-4 font-black uppercase leading-none text-3xl text-brand-ink sm:text-4xl lg:text-5xl">
            Resource Gratis
          </h2>
          <p className="mt-2 text-base text-brand-ink">
            Klik item untuk mengunduh instan — tanpa perlu akun.
          </p>
        </div>

        {resources.failed ? (
          <div className={CONTAINER}>
            <SectionError what="resource" />
          </div>
        ) : resourceRows.length === 0 ? (
          <div className={CONTAINER}>
            <SectionEmpty>
              Belum ada resource yang dibagikan. Nantikan ya!
            </SectionEmpty>
          </div>
        ) : (
          resourceRows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="marquee-mask mt-6 overflow-hidden"
            >
              {/* Jarak antar chip dipasang sebagai margin, bukan `gap`: dengan
                  `gap`, lebar track bukan kelipatan dua sehingga loop -50%
                  melompat sedikit. */}
              <div
                className={`flex w-max motion-reduce:animate-none ${
                  rowIndex === 0 ? "animate-marquee" : "animate-marquee-reverse"
                }`}
              >
                {[...row, ...row].map((resource, index) => (
                  <ResourceChip
                    key={`${resource.id}-${index}`}
                    resource={resource}
                    duplicate={index >= row.length}
                  />
                ))}
              </div>
            </div>
          ))
        )}

        <CenterCta href="/resource" label="Lihat Semua Resource" tone={BTN_TEAL} />
      </section>

      {/* ── Artikel ──────────────────────────────────────────── */}
      <section
        id="artikel"
        className="scroll-mt-24 border-b-[3px] border-[var(--hard-border)] bg-brand-article py-16 sm:py-24 dark:bg-surface"
      >
        <div className={CONTAINER}>
          <SectionHeading align="center" title="Artikel" />

          {posts.failed ? (
            <SectionError what="artikel" />
          ) : posts.rows.length === 0 ? (
            <SectionEmpty>Belum ada artikel yang terbit. Nantikan ya!</SectionEmpty>
          ) : (
            <>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articleCards.map((post) => (
                  <ArticleCard key={post.id} post={toArticleCard(post)} />
                ))}
              </div>
              {storyPost && <StoryCard post={storyPost} />}
            </>
          )}

          <CenterCta href="/artikel" label="Lihat Semua Artikel" tone={BTN_WHITE} />
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section
        id="faq"
        className="scroll-mt-24 border-b-[3px] border-[var(--hard-border)] bg-surface py-16 sm:py-24"
      >
        <div className="mx-auto w-full max-w-[816px] px-5 text-center sm:px-10">
          <span className="inline-block border-2 border-[var(--hard-border)] bg-accent-500 px-6 py-2.5 font-black text-lg uppercase text-white">
            FAQ
          </span>
          <h2 className="mt-2 font-black uppercase leading-none text-3xl sm:text-4xl lg:text-5xl">
            Pertanyaan Umum
          </h2>
          <p className="mt-2 text-base text-muted">
            Jawaban instan untuk calon anggota baru.
          </p>

          {faqSection.failed ? (
            <SectionError what="FAQ" />
          ) : faqItems.length === 0 ? (
            <SectionEmpty>Belum ada FAQ yang ditulis. Nantikan ya!</SectionEmpty>
          ) : (
            <div className="mt-8 flex flex-col gap-4 text-left">
              {/* Item pertama terbuka seperti di mockup. `open` hanya diisi
                  saat render pertama; setelah itu <details> mengurusnya
                  sendiri (tanpa state React). */}
              {faqItems.map((item, index) => (
                <FaqItem
                  key={item.id}
                  question={item.question}
                  answer={item.answer}
                  defaultOpen={index === 0}
                />
              ))}
            </div>
          )}

          <div className="mt-10">
            <p className="font-black text-base">Masih ada pertanyaan?</p>
            <div className="mt-4 flex justify-center">
              <Link href="/faq" className={BTN_RED}>
                Lihat Semua FAQ →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Lokasi ───────────────────────────────────────────── */}
      {settings?.address && (
        <section className="border-b-[3px] border-[var(--hard-border)] bg-brand-navy py-16 text-white sm:py-20">
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

      {/* Kembali ke atas: anchor biasa supaya tetap jalan tanpa JavaScript. */}
      <a
        href="#beranda"
        aria-label="Kembali ke atas"
        className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-btn border-[3px] border-[var(--hard-border)] bg-teal-500 text-xl text-white shadow-[6px_6px_0_0_var(--hard-shadow)]"
      >
        <span aria-hidden="true">↑</span>
      </a>
    </div>
  );
}
