import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import {
  POST_STATUSES,
  postCategoryLabel,
  postStatusBadgeClasses,
  postStatusLabel,
  type PostStatus,
} from "@/lib/postStatus";
import PublishDraftButton from "./PublishDraftButton";
import Icon from "@/components/ui/icons";

export const metadata = {
  title: "Artikel Saya — Mataram Dev",
  description: "Artikel dan draf yang kamu tulis untuk komunitas Mataram Dev.",
};

interface MyPostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  status: string;
  category: string | null;
  published_date: string | null;
  created_at: string;
}

interface MyPostsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MyPostsPage({ searchParams }: MyPostsPageProps) {
  const params = await searchParams;
  const created =
    params.created === "published" || params.created === "draft"
      ? params.created
      : null;
  const updated =
    params.updated === "published" || params.updated === "draft"
      ? params.updated
      : null;
  const deleted = params.deleted === "1";

  const requested = typeof params.status === "string" ? params.status : undefined;
  const activeFilter: PostStatus | "all" =
    requested === "all" ||
    (requested && POST_STATUSES.includes(requested as PostStatus))
      ? (requested as PostStatus | "all")
      : "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, slug, title, excerpt, image_url, status, category, published_date, created_at"
    )
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil artikel Anda: ${error.message}`);
  }

  const posts = (data || []) as unknown as MyPostRow[];

  const counts = { all: posts.length, draft: 0, published: 0 };
  for (const post of posts) {
    if (POST_STATUSES.includes(post.status as PostStatus)) {
      counts[post.status as PostStatus] += 1;
    }
  }

  const visible =
    activeFilter === "all"
      ? posts
      : posts.filter((post) => post.status === activeFilter);

  const tabs: { key: PostStatus | "all"; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "draft", label: "Draf" },
    { key: "published", label: "Terbit" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-black uppercase leading-none text-2xl">
            Artikel Saya
          </h1>
          <p className="mt-1 text-sm text-muted">
            Artikel yang sudah terbit dan draf yang belum selesai.
          </p>
        </div>
        <Link
          href="/artikel/baru"
          className="rounded-btn bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600"
        >
          + Tulis Artikel
        </Link>
      </div>

      {created && (
        <div className="rounded-card border border-[var(--hard-border)] bg-brand-green p-4 dark:border-[var(--hard-border)] dark:bg-brand-green">
          <p className="text-sm font-medium text-white">
            {created === "published"
              ? "Artikel berhasil diterbitkan!"
              : "Draf tersimpan!"}
          </p>
          <p className="mt-1 text-sm text-white/90">
            {created === "published"
              ? "Artikel kamu sudah tampil di halaman Artikel komunitas."
              : "Draf ini hanya terlihat oleh kamu. Terbitkan kapan saja lewat tombol Terbitkan di bawah."}
          </p>
        </div>
      )}

      {updated && (
        <div className="rounded-card border border-[var(--hard-border)] bg-brand-green p-4 dark:border-[var(--hard-border)] dark:bg-brand-green">
          <p className="text-sm font-medium text-white">
            Perubahan tersimpan!
          </p>
          <p className="mt-1 text-sm text-white/90">
            {updated === "published"
              ? "Artikel kamu sudah diperbarui dan tetap tampil di halaman Artikel."
              : "Artikel ini sekarang berstatus draf, jadi tidak tampil di halaman publik sampai diterbitkan lagi."}
          </p>
        </div>
      )}

      {deleted && (
        <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-4 dark:border-[var(--hard-border)] dark:bg-surface-2">
          <p className="text-sm font-medium text-foreground dark:text-foreground">
            Artikel sudah dihapus.
          </p>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-12 text-center dark:border-[var(--hard-border)] dark:bg-surface-2">
          <p className="text-muted">
            Kamu belum menulis artikel apa pun.
          </p>
          <Link
            href="/artikel/baru"
            className="mt-4 inline-block rounded-btn bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600"
          >
            Tulis Artikel Pertama
          </Link>
        </div>
      ) : (
        <>
          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Link
                key={tab.key}
                href={`/artikel-saya?status=${tab.key}`}
                className={`rounded-btn border-[3px] border-[var(--hard-border)] px-4 py-1.5 font-mono text-[11px] font-bold uppercase transition-colors ${
                  activeFilter === tab.key
                    ? "border-[var(--hard-border)] bg-accent-500 text-white"
                    : "border-[var(--hard-border)] text-foreground hover:bg-surface-3 dark:border-[var(--hard-border)] dark:text-foreground dark:hover:bg-surface-3"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1.5 text-xs ${
                    activeFilter === tab.key
                      ? "text-white/80"
                      : "text-muted"
                  }`}
                >
                  {counts[tab.key]}
                </span>
              </Link>
            ))}
          </nav>

          {visible.length === 0 ? (
            <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-12 text-center dark:border-[var(--hard-border)] dark:bg-surface-2">
              <p className="text-muted">
                {activeFilter === "all"
                  ? "Belum ada artikel."
                  : `Tidak ada artikel berstatus "${postStatusLabel(activeFilter)}".`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((post) => {
                const isPublished = post.status === "published";

                return (
                  <div
                    key={post.id}
                    className="flex gap-4 rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-4 dark:border-[var(--hard-border)] dark:bg-surface-2"
                  >
                    {post.image_url ? (
                      <div className="relative hidden h-20 w-32 shrink-0 overflow-hidden rounded-btn bg-surface-3 sm:block dark:bg-surface-3">
                        <Image
                          src={post.image_url}
                          alt={post.title}
                          fill
                          sizes="128px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="hidden h-20 w-32 shrink-0 items-center justify-center rounded-btn bg-surface-3 text-muted sm:flex dark:bg-surface-3">
                        <Icon name="pen" className="size-7" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {isPublished ? (
                          <Link
                            href={`/artikel/${post.slug}`}
                            className="truncate font-black uppercase text-sm hover:text-teal-600 dark:text-foreground dark:hover:text-teal-300"
                          >
                            {post.title}
                          </Link>
                        ) : (
                          <span className="truncate font-black uppercase text-sm">
                            {post.title}
                          </span>
                        )}
                        <span
                          className={`inline-flex shrink-0 items-center px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${postStatusBadgeClasses(post.status)}`}
                        >
                          {postStatusLabel(post.status)}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-muted">
                        {post.category && `${postCategoryLabel(post.category)} • `}
                        {isPublished && post.published_date
                          ? `Terbit ${formatDate(post.published_date)}`
                          : `Dibuat ${formatDate(post.created_at)}`}
                      </p>

                      {post.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Link
                        href={`/artikel/${post.slug}/edit`}
                        className="rounded-btn border-[3px] border-[var(--hard-border)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-3 dark:border-[var(--hard-border)] dark:text-foreground dark:hover:bg-surface-3"
                      >
                        Edit
                      </Link>
                      {isPublished ? (
                        <Link
                          href={`/artikel/${post.slug}`}
                          className="rounded-btn border-[3px] border-[var(--hard-border)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-3 dark:border-[var(--hard-border)] dark:text-foreground dark:hover:bg-surface-3"
                        >
                          Lihat
                        </Link>
                      ) : (
                        <PublishDraftButton postId={post.id} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
