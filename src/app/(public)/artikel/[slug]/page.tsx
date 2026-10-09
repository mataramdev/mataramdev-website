import type { Metadata } from "next";
import Image from "next/image";
import { pickThumbnail } from "@/lib/thumbnails";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, oneRelation } from "@/lib/utils";
import { postCategoryLabel } from "@/lib/postStatus";
import { getSiteUrl, toMetaDescription } from "@/lib/seo";
import Markdown from "@/components/Markdown";
import {
  BackLink,
  CATEGORY_TAG,
  HARD_CARD,
  NEO_BADGE,
  initials,
} from "@/components/ui/brutalist";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

/** Per-article title/OG/canonical built from the row (Task 9.4 / PRD §5). */
export async function generateMetadata({
  params,
}: ArticleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  // maybeSingle: a missing/withdrawn article must give a clean 404 page, not
  // crash metadata generation with a thrown error.
  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt, content, image_url, published_date")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!post) {
    return { title: "Artikel tidak ditemukan" };
  }

  const description = toMetaDescription(post.excerpt || post.content);
  const url = new URL(`/artikel/${slug}`, getSiteUrl());

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url,
      publishedTime: post.published_date ?? undefined,
      images: post.image_url ? [{ url: post.image_url }] : undefined,
    },
    twitter: {
      card: post.image_url ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: post.image_url ? [post.image_url] : undefined,
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: ArticleDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // maybeSingle, not single: `.single()` answers a PGRST116 error when no row
  // matches, which this page turns into a thrown error (500) before it can
  // reach notFound(). A withdrawn or misspelled slug must be a 404, both for
  // visitors and for search crawlers.
  const { data: post, error } = await supabase
    .from("posts")
    .select("*, users(fullname, username, image_url, bio)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal mengambil detail artikel: ${error.message}`);
  }

  if (!post) {
    notFound();
  }

  const author = oneRelation(
    post.users as
      | {
          fullname: string | null;
          username: string | null;
          image_url: string | null;
          bio: string | null;
        }[]
      | null,
  );
  const authorName = author?.fullname || author?.username || "Anonim";

  // Sampul dari penulis, atau foto cadangan dari `public/images/content/`.
  const cover = post.image_url ?? pickThumbnail("article", post.slug);

  return (
    <article className="bg-background py-16 sm:py-24">
      <div className="mx-auto w-full max-w-[896px] px-5 sm:px-10">
        <BackLink href="/artikel">← Kembali ke artikel</BackLink>

        {post.category && (
          <div className="mt-8">
            <Link
              href={`/artikel?kategori=${post.category}`}
              className={`${NEO_BADGE} text-white ${
                CATEGORY_TAG[post.category] ?? "bg-zinc-500"
              }`}
            >
              {postCategoryLabel(post.category)}
            </Link>
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/artikel?tag=${encodeURIComponent(tag)}`}
                className="font-mono text-xs text-muted hover:text-accent-500"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <h1 className="mt-5 font-black uppercase leading-none text-3xl sm:text-4xl lg:text-5xl">
          {post.title}
        </h1>

        <div className="mt-6 flex items-center gap-3">
          {author?.image_url ? (
            <Image
              src={author.image_url}
              alt={authorName}
              width={40}
              height={40}
              className="size-10 border-2 border-[var(--hard-border)] object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center border-2 border-[var(--hard-border)] bg-brand-yellow font-mono text-xs font-bold text-black"
            >
              {initials(authorName)}
            </span>
          )}
          <div>
            <p className="font-black text-sm text-foreground">{authorName}</p>
            {post.published_date && (
              <p className="font-mono text-xs text-muted">
                {formatDate(post.published_date)}
              </p>
            )}
          </div>
        </div>

        {cover && (
          <div className="relative mt-8 aspect-video border-[3px] border-[var(--hard-border)] shadow-[10px_10px_0_0_var(--hard-shadow)]">
            {/* Stored covers carry no dimensions, so the hero gets a fixed 16:9
                box (no layout shift) and crops the overflow. */}
            <Image
              src={cover}
              alt={post.title}
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              loading="eager"
              className="object-cover"
            />
          </div>
        )}

        {post.excerpt && (
          <p
            className={`${HARD_CARD} mt-10 bg-surface-2 p-6 text-lg leading-snug text-muted`}
          >
            {post.excerpt}
          </p>
        )}

        {post.content ? (
          <Markdown className="mt-10">{post.content}</Markdown>
        ) : (
          <p className="mt-10 text-muted">Artikel ini belum punya isi.</p>
        )}
      </div>
    </article>
  );
}
