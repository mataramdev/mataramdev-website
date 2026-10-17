import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { oneRelation } from "@/lib/utils";
import { ArticleCard } from "@/components/cards";
import Icon from "@/components/ui/icons";
import {
  BTN_SM_RED,
  CONTAINER,
  FilterChip,
  NEO_BADGE,
  PageHeader,
  SectionEmpty,
} from "@/components/ui/brutalist";
import {
  POST_CATEGORIES,
  POST_CATEGORY_LABELS,
  isPostCategory,
  postCategoryLabel,
} from "@/lib/postStatus";

export const metadata = {
  title: "Artikel — Mataram Dev",
  description:
    "Tutorial, tips, dan cerita dari developer & designer komunitas Mataram.",
};

interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  category: string | null;
  tags: string[] | null;
  published_date: string | null;
  users: { fullname: string | null; username: string | null } | null;
}

interface ArticleListPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ArticleListPage({
  searchParams,
}: ArticleListPageProps) {
  const params = await searchParams;
  const categoryParam =
    typeof params.kategori === "string" ? params.kategori : undefined;
  const activeCategory = isPostCategory(categoryParam) ? categoryParam : null;
  const activeTag =
    typeof params.tag === "string" && params.tag.trim().length > 0
      ? params.tag.trim()
      : null;

  const supabase = await createClient();

  // Task 9.6: category and tag filters combine (`?kategori=x&tag=y`).
  let query = supabase
    .from("posts")
    .select(
      "id, slug, title, excerpt, image_url, category, tags, published_date, users(fullname, username)",
    )
    .eq("status", "published")
    .order("published_date", { ascending: false, nullsFirst: false });

  if (activeCategory) {
    query = query.eq("category", activeCategory);
  }
  if (activeTag) {
    // Supabase array containment: rows whose `tags` include this value.
    query = query.contains("tags", [activeTag]);
  }

  // Distinct tags across published articles, also fetched in parallel.
  const [{ data, error }, { data: tagRows }] = await Promise.all([
    query,
    supabase.from("posts").select("tags").eq("status", "published"),
  ]);

  if (error) {
    throw new Error(`Gagal mengambil data artikel: ${error.message}`);
  }

  const posts = (data || []) as unknown as PostRow[];

  const allTags = Array.from(
    new Set((tagRows ?? []).flatMap((row) => row.tags ?? [])),
  ).sort((a, b) => a.localeCompare(b, "id"));

  const filters: { label: string; value: string | null }[] = [
    { label: "Semua", value: null },
    ...POST_CATEGORIES.map((category) => ({
      label: POST_CATEGORY_LABELS[category],
      value: category as string,
    })),
  ];

  /** Keeps the other active filter when switching one of them. */
  const buildHref = (next: { category?: string | null; tag?: string | null }) => {
    const category = next.category === undefined ? activeCategory : next.category;
    const tag = next.tag === undefined ? activeTag : next.tag;
    const search = new URLSearchParams();
    if (category) search.set("kategori", category);
    if (tag) search.set("tag", tag);
    const qs = search.toString();
    return qs ? `/artikel?${qs}` : "/artikel";
  };

  return (
    <div className="bg-background py-16 sm:py-24">
      <div className={CONTAINER}>
        <PageHeader
          badge="Tulisan Komunitas"
          title="Artikel"
          description="Tutorial, tips, dan cerita dari developer & designer Mataram."
          actions={
            <Link href="/artikel/baru" className={BTN_SM_RED}>
              + Tulis Artikel
            </Link>
          }
        />

        <nav className="mt-8 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <FilterChip
              key={filter.label}
              href={buildHref({ category: filter.value })}
              active={activeCategory === filter.value}
            >
              {filter.label}
            </FilterChip>
          ))}
        </nav>

        {allTags.length > 0 && (
          <nav className="mt-3 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] font-bold uppercase text-muted">
              Tag
            </span>
            {activeTag && (
              <Link href={buildHref({ tag: null })}>
                <span className={`${NEO_BADGE} bg-brand-ink inline-flex items-center gap-1.5 text-white`}>
                  <Icon name="close" className="size-3" />
                  {activeTag}
                </span>
              </Link>
            )}
            {allTags.map((tag) => (
              <Link key={tag} href={buildHref({ tag })}>
                <span
                  className={`${NEO_BADGE} ${
                    activeTag === tag
                      ? "bg-accent-500 text-white"
                      : "bg-surface-2 text-foreground"
                  }`}
                >
                  #{tag}
                </span>
              </Link>
            ))}
          </nav>
        )}

        {posts.length === 0 ? (
          <SectionEmpty>
            {activeTag
              ? `Belum ada artikel dengan tag #${activeTag}.`
              : activeCategory
                ? `Belum ada artikel kategori "${postCategoryLabel(activeCategory)}".`
                : "Belum ada artikel yang terbit. Nantikan ya!"}
          </SectionEmpty>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const author = oneRelation(post.users);

              return (
                <ArticleCard
                  key={post.id}
                  post={{
                    slug: post.slug,
                    title: post.title,
                    excerpt: post.excerpt,
                    imageUrl: post.image_url,
                    category: post.category,
                    publishedDate: post.published_date,
                    authorName:
                      author?.fullname || author?.username || "Anonim",
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
