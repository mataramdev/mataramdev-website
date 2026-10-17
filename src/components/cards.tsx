import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { eventStatusLabel } from "@/lib/eventStatus";
import { postCategoryLabel } from "@/lib/postStatus";
import Icon, { type IconName } from "@/components/ui/icons";
import {
  CATEGORY_TAG,
  CardImage,
  HARD_CARD,
  STATUS_TAG,
  durationLabel,
  initials,
  timeRange,
} from "@/components/ui/brutalist";

/**
 * Kartu neo-brutalist bersama untuk event, proyek, dan artikel.
 *
 * Dipakai halaman depan sekaligus halaman daftar (`/event`, `/proyek`,
 * `/artikel`) — dulu markup ini hidup hanya di `src/app/(public)/page.tsx`,
 * sekarang satu sumber supaya tiga halaman tidak perlahan berbeda gaya.
 * Tampilan sengaja sama persis dengan versi halaman depan.
 */

export interface EventCardData {
  slug: string;
  title: string;
  excerpt: string | null;
  imageUrl: string | null;
  status: string;
  startTime: string | null;
  endTime?: string | null;
  locationName?: string | null;
}

/**
 * Satu item meta di kartu proyek. Sebelumnya `string` berisi emoji di dalam
 * teks ("👥 3 kontributor"); sekarang ikonnya dipisah supaya bisa dirender
 * sebagai SVG (emoji tampil beda antar OS dan tidak bisa diwarnai).
 */
export interface CardMeta {
  icon: IconName;
  label: string;
}

export interface ProjectCardData {
  slug: string;
  name: string;
  content: string | null;
  imageUrl: string | null;
  stackNames: string[];
  /** Label kontributor yang sudah diformat ("@aldi"). Kosong = tidak tampil. */
  contributors?: string[];
  /** Baris meta kecil di bawah tag stack (github/demo/jumlah kontributor). */
  meta?: CardMeta[];
}

export interface ArticleCardData {
  slug: string;
  title: string;
  excerpt: string | null;
  imageUrl: string | null;
  category?: string | null;
  publishedDate?: string | null;
  authorName?: string | null;
}

export function EventCard({ event }: { event: EventCardData }) {
  const range = timeRange(event.startTime, event.endTime ?? null);
  const duration = durationLabel(event.startTime, event.endTime ?? null);
  const isOpen = event.status === "upcoming" || event.status === "ongoing";

  return (
    <article className={`${HARD_CARD} flex flex-col bg-surface-2 text-foreground`}>
      <div className="relative">
        <CardImage
          src={event.imageUrl}
          alt={event.title}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          emoji="📅"
          fallbackKind="event"
          seed={event.slug}
        />
        <span
          className={`absolute right-3 top-3 border-2 border-[var(--hard-border)] px-3 py-1 font-mono text-[11px] font-bold uppercase text-white ${
            STATUS_TAG[event.status] ?? "bg-zinc-500"
          }`}
        >
          {eventStatusLabel(event.status)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        {event.startTime && (
          <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-300">
            <Icon name="calendar" className="size-3.5" />
            {formatDate(event.startTime)}
          </span>
        )}
        <h3 className="font-black uppercase leading-tight text-lg">
          {event.title}
        </h3>
        {event.locationName && (
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span className="size-1.5 shrink-0 rounded-full bg-accent-500" />
            {event.locationName}
          </div>
        )}
        {range && (
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span className="size-1.5 shrink-0 rounded-full bg-accent-500" />
            {range}
          </div>
        )}
        {duration && (
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span className="size-1.5 shrink-0 rounded-full bg-accent-500" />
            {duration}
          </div>
        )}
        {event.excerpt && (
          <p className="flex-1 text-sm leading-relaxed text-muted">
            {event.excerpt}
          </p>
        )}
        <div className="mt-1.5 flex gap-2">
          <Link
            href={`/event/${event.slug}`}
            className="flex-1 border-[3px] border-[var(--hard-border)] bg-surface-2 px-3 py-2 text-center font-mono text-[11px] font-bold uppercase"
          >
            Detail
          </Link>
          <Link
            href={`/event/${event.slug}`}
            className={`flex-1 border-[3px] border-[var(--hard-border)] px-3 py-2 text-center font-mono text-[11px] font-bold uppercase text-white ${
              isOpen ? "bg-accent-700" : "bg-zinc-500"
            }`}
          >
            {event.status === "upcoming" ? "RSVP" : eventStatusLabel(event.status)}
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const contributors = project.contributors ?? [];

  return (
    <article className={`${HARD_CARD} flex flex-col bg-surface-2 text-foreground`}>
      <CardImage
        src={project.imageUrl}
        alt={project.name}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        emoji="🚀"
        fallbackKind="project"
        seed={project.slug}
      />
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <h3 className="font-black uppercase leading-tight text-xl">
          {project.name}
        </h3>
        {contributors.length > 0 && (
          <span className="font-mono text-xs text-muted">
            Kontributor: {contributors.join(", ")}
          </span>
        )}
        {project.content && (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted">
            {project.content}
          </p>
        )}
        {project.stackNames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.stackNames.map((name) => (
              <span
                key={name}
                className="border-2 border-[var(--hard-border)] bg-brand-yellow px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-black"
              >
                {name}
              </span>
            ))}
          </div>
        )}
        {(project.meta?.length ?? 0) > 0 && (
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-muted">
            {project.meta?.map((entry) => (
              <span key={entry.label} className="flex items-center gap-1.5">
                <Icon name={entry.icon} className="size-3.5" />
                {entry.label}
              </span>
            ))}
          </div>
        )}
        <Link
          href={`/proyek/${project.slug}`}
          className="mt-auto pt-1 font-black uppercase text-sm text-accent-500"
        >
          Jelajahi →
        </Link>
      </div>
    </article>
  );
}

export function ArticleCard({ post }: { post: ArticleCardData }) {
  const authorName = post.authorName || "Anonim";

  return (
    <article className={`${HARD_CARD} flex flex-col bg-surface-2 text-foreground`}>
      <div className="relative">
        <CardImage
          src={post.imageUrl}
          alt={post.title}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          emoji="✍️"
          fallbackKind="article"
          seed={post.slug}
        />
        {post.category && (
          <span
            className={`absolute left-3 top-3 border-2 border-[var(--hard-border)] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-white ${
              CATEGORY_TAG[post.category] ?? "bg-zinc-500"
            }`}
          >
            {postCategoryLabel(post.category)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <h3 className="font-black leading-tight text-base">{post.title}</h3>
        {post.excerpt && (
          <p className="flex-1 text-sm leading-relaxed text-muted">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex size-6 items-center justify-center border-2 border-[var(--hard-border)] bg-brand-yellow font-mono text-[10px] font-bold text-black"
            >
              {initials(authorName)}
            </span>
            <span className="font-black text-xs">{authorName}</span>
          </span>
          {post.publishedDate && (
            <span className="font-mono text-[11px] text-muted">
              {formatDate(post.publishedDate)}
            </span>
          )}
        </div>
        <Link
          href={`/artikel/${post.slug}`}
          className="font-black uppercase text-xs text-accent-500"
        >
          Baca →
        </Link>
      </div>
    </article>
  );
}
