import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { postCategoryLabel } from "@/lib/postStatus";
import { getSiteUrl, toMetaDescription } from "@/lib/seo";
import Icon from "@/components/ui/icons";
import {
  BackLink,
  CATEGORY_TAG,
  CONTAINER,
  HARD_CARD,
  NEO_BADGE,
  SectionEmpty,
  initials,
} from "@/components/ui/brutalist";

interface MemberProfilePageProps {
  params: Promise<{ username: string }>;
}

interface ProfileRow {
  id: string;
  fullname: string | null;
  username: string | null;
  bio: string | null;
  image_url: string | null;
  created_at: string | null;
}

interface ProjectRow {
  id: string;
  slug: string;
  name: string;
  content: string | null;
  image_url: string | null;
}

interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  tags: string[] | null;
  published_date: string | null;
}

function displayName(profile: ProfileRow): string {
  return profile.fullname?.trim() || profile.username?.trim() || "Anggota";
}

/** Only public columns — `users.email` is revoked for anon AND authenticated. */
async function getProfile(username: string): Promise<ProfileRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, fullname, username, bio, image_url, created_at")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal mengambil profil anggota: ${error.message}`);
  }

  return (data as ProfileRow | null) ?? null;
}

/** Per-member title/OG built from the row (Task 9.4 pattern). */
export async function generateMetadata({
  params,
}: MemberProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfile(decodeURIComponent(username));

  if (!profile) {
    return { title: "Anggota tidak ditemukan" };
  }

  const name = displayName(profile);
  const description =
    toMetaDescription(profile.bio) ||
    `Profil ${name} di komunitas Mataram Dev.`;
  const url = new URL(
    `/anggota/${encodeURIComponent(profile.username ?? username)}`,
    getSiteUrl(),
  );

  return {
    title: name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      title: name,
      description,
      url,
      images: profile.image_url ? [{ url: profile.image_url }] : undefined,
    },
  };
}

export default async function MemberProfilePage({
  params,
}: MemberProfilePageProps) {
  const { username } = await params;
  const profile = await getProfile(decodeURIComponent(username));

  if (!profile) {
    notFound();
  }

  const supabase = await createClient();

  // Approved projects the member contributes to. Two steps because filtering
  // an embedded to-many relation from the parent is easy to get wrong.
  const { data: contributorRows } = await supabase
    .from("project_contributors")
    .select("project_id")
    .eq("user_id", profile.id);

  const projectIds = (contributorRows ?? []).map(
    (row: { project_id: string }) => row.project_id,
  );

  const [projectsResult, postsResult, linksResult] = await Promise.all([
    projectIds.length > 0
      ? supabase
          .from("projects")
          .select("id, slug, name, content, image_url")
          .in("id", projectIds)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("posts")
      .select("id, slug, title, excerpt, category, tags, published_date")
      .eq("author_id", profile.id)
      .eq("status", "published")
      .order("published_date", { ascending: false, nullsFirst: false }),
    supabase
      .from("social_links")
      .select("platform, url")
      .eq("owner_type", "user")
      .eq("owner_id", profile.id),
  ]);

  if (projectsResult.error || postsResult.error || linksResult.error) {
    throw new Error("Gagal memuat data profil anggota");
  }

  const projects = (projectsResult.data ?? []) as unknown as ProjectRow[];
  const posts = (postsResult.data ?? []) as unknown as PostRow[];
  const links = (linksResult.data ?? []) as { platform: string; url: string }[];
  const name = displayName(profile);

  return (
    <div className="bg-background py-16 sm:py-24">
      <div className={CONTAINER}>
        <BackLink href="/anggota">← Semua anggota</BackLink>

        <header className={`${HARD_CARD} mt-8 flex flex-col gap-6 bg-surface-2 p-6 sm:flex-row sm:items-center`}>
          {profile.image_url ? (
            <Image
              src={profile.image_url}
              alt={`Foto profil ${name}`}
              width={96}
              height={96}
              className="size-24 shrink-0 border-[3px] border-[var(--hard-border)] object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-24 shrink-0 items-center justify-center border-[3px] border-[var(--hard-border)] bg-brand-yellow font-mono text-3xl font-bold text-black"
            >
              {initials(name)}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="font-black uppercase leading-none text-2xl sm:text-3xl">
              {name}
            </h1>
            {profile.username && (
              <p className="mt-1 font-mono text-sm text-muted">
                @{profile.username}
              </p>
            )}
            {profile.bio && (
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {profile.bio}
              </p>
            )}
            <p className="mt-3 font-mono text-[11px] uppercase text-muted">
              Bergabung{" "}
              {profile.created_at ? formatDate(profile.created_at) : "-"}
              {" · "}
              {projects.length} proyek · {posts.length} artikel
            </p>

            {links.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {links.map((link) => (
                  <a
                    key={`${link.platform}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${NEO_BADGE} bg-surface text-foreground`}
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
        </header>

        <section className="mt-14">
          <h2 className="font-black uppercase text-2xl">Proyek</h2>
          {projects.length === 0 ? (
            <SectionEmpty>Belum ada proyek terkurasi dari anggota ini.</SectionEmpty>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/proyek/${project.slug}`}
                  className={`${HARD_CARD} flex h-full flex-col overflow-hidden bg-surface-2`}
                >
                  {project.image_url ? (
                    <div className="relative aspect-video border-b-[3px] border-[var(--hard-border)] bg-gradient-to-br from-zinc-600 to-zinc-900">
                      <Image
                        src={project.image_url}
                        alt={project.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center border-b-[3px] border-[var(--hard-border)] bg-gradient-to-br from-zinc-600 to-zinc-900 text-white">
                      <Icon name="rocket" className="size-8" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-black uppercase text-lg">
                      {project.name}
                    </h3>
                    {project.content && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted">
                        {project.content}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-14">
          <h2 className="font-black uppercase text-2xl">Artikel</h2>
          {posts.length === 0 ? (
            <SectionEmpty>Belum ada artikel terbit dari anggota ini.</SectionEmpty>
          ) : (
            <div className="mt-6 flex flex-col gap-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/artikel/${post.slug}`}
                  className={`${HARD_CARD} block bg-surface-2 p-5`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    {post.category && (
                      <span
                        className={`${NEO_BADGE} text-white ${
                          CATEGORY_TAG[post.category] ?? "bg-zinc-500"
                        }`}
                      >
                        {postCategoryLabel(post.category)}
                      </span>
                    )}
                    {post.published_date && (
                      <span className="font-mono text-[11px] text-muted">
                        {formatDate(post.published_date)}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 font-black leading-tight text-base">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted">
                      {post.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
