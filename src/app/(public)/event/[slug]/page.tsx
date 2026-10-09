import type { Metadata } from "next";
import Image from "next/image";
import { pickThumbnail } from "@/lib/thumbnails";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import { eventStatusLabel } from "@/lib/eventStatus";
import { getSiteUrl, toMetaDescription } from "@/lib/seo";
import {
  BackLink,
  HARD_CARD,
  NEO_BADGE,
  STATUS_TAG,
  initials,
} from "@/components/ui/brutalist";
import RSVPButton from "./RSVPButton";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

/** Per-event title/OG/canonical built from the row (Task 9.4 / PRD §5). */
export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("title, excerpt, description, image_url, start_time")
    .eq("slug", slug)
    .maybeSingle();

  if (!event) {
    return { title: "Event tidak ditemukan" };
  }

  const description = toMetaDescription(event.excerpt || event.description);
  const url = new URL(`/event/${slug}`, getSiteUrl());

  return {
    title: event.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: event.title,
      description,
      url,
      images: event.image_url ? [{ url: event.image_url }] : undefined,
    },
    twitter: {
      card: event.image_url ? "summary_large_image" : "summary",
      title: event.title,
      description,
      images: event.image_url ? [event.image_url] : undefined,
    },
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // maybeSingle so an unknown slug reaches notFound() (404) instead of
  // throwing on PGRST116 (500) — see the note in artikel/[slug]/page.tsx.
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal mengambil data event: ${error.message}`);
  }

  if (!event) {
    notFound();
  }

  // Fetch RSVP data
  const [
    { count: rsvpCount },
    { data: { user } },
  ] = await Promise.all([
    supabase
      .from("event_rsvp")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id)
      .eq("status", "going"),
    supabase.auth.getUser(),
  ]);

  // Check if current user has RSVP'd
  let userRsvpStatus: "going" | "cancelled" | null = null;
  if (user) {
    const { data: rsvp } = await supabase
      .from("event_rsvp")
      .select("status")
      .eq("event_id", event.id)
      .eq("user_id", user.id)
      .single();
    userRsvpStatus = rsvp?.status ?? null;
  }

  // Pembicara event (Task aset gambar: foto berlabel nama → pembicara).
  const { data: speakers } = await supabase
    .from("event_speakers")
    .select("id, name, topic, photo_url")
    .eq("event_id", event.id)
    .order("order", { ascending: true });

  const canRsvp = event.status === "upcoming" || event.status === "ongoing";

  // Sampul dari admin, atau foto cadangan dari `public/images/events/` supaya
  // halaman detail tidak pernah kosong gambarnya.
  const cover = event.image_url ?? pickThumbnail("event", event.slug);

  return (
    <article className="bg-background py-16 sm:py-24">
      <div className="mx-auto w-full max-w-[896px] px-5 sm:px-10">
        <BackLink href="/event">← Kembali ke daftar event</BackLink>

        {cover && (
          <div className="relative mt-8 aspect-video border-[3px] border-[var(--hard-border)] shadow-[10px_10px_0_0_var(--hard-shadow)]">
            {/* Stored covers carry no dimensions, so the hero gets a fixed 16:9
                box (no layout shift) and crops the overflow. */}
            <Image
              src={cover}
              alt={event.title}
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              loading="eager"
              className="object-cover"
            />
          </div>
        )}

        <div className="mt-8">
          <span
            className={`${NEO_BADGE} text-white ${
              STATUS_TAG[event.status] ?? "bg-zinc-500"
            }`}
          >
            {eventStatusLabel(event.status)}
          </span>
        </div>

        <h1 className="mt-4 font-black uppercase leading-none text-3xl sm:text-4xl lg:text-5xl">
          {event.title}
        </h1>

        {event.excerpt && (
          <p className="mt-4 text-lg leading-snug text-muted">{event.excerpt}</p>
        )}

        <dl className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className={`${HARD_CARD} bg-surface-2 p-6`}>
            <dt className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
              Waktu
            </dt>
            <dd className="mt-2 text-sm text-foreground">
              {event.start_time
                ? formatDateTime(event.start_time)
                : "Belum ditentukan"}
              {event.end_time && ` — ${formatDateTime(event.end_time)}`}
            </dd>
          </div>

          <div className={`${HARD_CARD} bg-surface-2 p-6`}>
            <dt className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
              Lokasi
            </dt>
            <dd className="mt-2 text-sm text-foreground">
              {event.location_name || "Belum ditentukan"}
              {event.location_url && (
                <>
                  {" "}
                  <a
                    href={event.location_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-teal-600 underline underline-offset-2 dark:text-teal-300"
                  >
                    Lihat peta
                  </a>
                </>
              )}
            </dd>
          </div>
        </dl>

        {canRsvp && (
          <div className={`${HARD_CARD} mt-8 bg-surface-2 p-6`}>
            <h2 className="font-black uppercase text-lg">Daftar Event</h2>
            <p className="mt-1 text-sm text-muted">
              {event.status === "upcoming"
                ? "Daftar sekarang untuk ikut event ini."
                : "Event sedang berlangsung. Anda masih bisa mendaftar."}
            </p>
            <div className="mt-5">
              <RSVPButton
                eventId={event.id}
                isLoggedIn={Boolean(user)}
                loginHref={`/login?redirectedFrom=/event/${event.slug}`}
                initialJoined={userRsvpStatus === "going"}
                initialCount={rsvpCount ?? 0}
              />
            </div>
          </div>
        )}

        {/* Markdown, like articles: the admin event form says the description
            supports Markdown (src/app/admin/event/EventForm.tsx). */}
        {event.description && (
          <Markdown className="mt-10">{event.description}</Markdown>
        )}

        {speakers && speakers.length > 0 && (
          <section className="mt-12">
            <h2 className="font-black uppercase text-xl">Pembicara</h2>
            <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {speakers.map((speaker) => (
                <li key={speaker.id} className={`${HARD_CARD} bg-surface-2 p-4`}>
                  <div className="relative aspect-square border-[3px] border-[var(--hard-border)] bg-brand-navy">
                    {speaker.photo_url ? (
                      <Image
                        src={speaker.photo_url}
                        alt={speaker.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 280px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center font-black text-4xl text-white">
                        {initials(speaker.name)}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 font-black uppercase leading-tight">
                    {speaker.name}
                  </p>
                  {speaker.topic && (
                    <p className="mt-1 text-sm text-muted">{speaker.topic}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
