import type { Metadata } from "next";
import Image from "next/image";
import { pickThumbnail } from "@/lib/thumbnails";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, toMetaDescription } from "@/lib/seo";
import { oneRelation } from "@/lib/utils";
import Icon from "@/components/ui/icons";
import {
  BackLink,
  BTN_SM_RED,
  BTN_SM_WHITE,
  HARD_CARD,
  initials,
} from "@/components/ui/brutalist";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

/** Per-project title/OG/canonical built from the row (Task 9.4 / PRD §5). */
export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("name, content, image_url")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  if (!project) {
    return { title: "Proyek tidak ditemukan" };
  }

  const description = toMetaDescription(project.content);
  const url = new URL(`/proyek/${slug}`, getSiteUrl());

  return {
    title: project.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: project.name,
      description,
      url,
      images: project.image_url ? [{ url: project.image_url }] : undefined,
    },
    twitter: {
      card: project.image_url ? "summary_large_image" : "summary",
      title: project.name,
      description,
      images: project.image_url ? [project.image_url] : undefined,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch project (only approved)
  // maybeSingle so an unknown/unapproved slug reaches notFound() (404)
  // instead of throwing on PGRST116 (500) — see artikel/[slug]/page.tsx.
  const { data: project, error } = await supabase
    .from("projects")
    .select("*, project_stacks(stack_id, stacks(name, id))")
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal mengambil data proyek: ${error.message}`);
  }

  if (!project) {
    notFound();
  }

  // Fetch contributors with user info
  const { data: contributors } = await supabase
    .from("project_contributors")
    .select("user_id, users(fullname, username, image_url)")
    .eq("project_id", project.id);

  // Extract stacks. `project_stacks` is a to-many embed (array); each nested
  // `stacks` row is to-one.
  const stacks =
    project.project_stacks
      ?.map((ps: { stacks: { name: string; id: string }[] }) =>
        oneRelation(ps.stacks),
      )
      .filter(Boolean) || [];

  // Sampul dari admin, atau foto cadangan dari `public/images/events/`.
  const cover = project.image_url ?? pickThumbnail("project", project.slug);

  return (
    <article className="bg-background py-16 sm:py-24">
      <div className="mx-auto w-full max-w-[896px] px-5 sm:px-10">
        <BackLink href="/proyek">← Kembali ke proyek</BackLink>

        {cover && (
          <div className="relative mt-8 aspect-video border-[3px] border-[var(--hard-border)] shadow-[10px_10px_0_0_var(--hard-shadow)]">
            {/* Stored covers carry no dimensions, so the hero gets a fixed 16:9
                box (no layout shift) and crops the overflow. */}
            <Image
              src={cover}
              alt={project.name}
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              loading="eager"
              className="object-cover"
            />
          </div>
        )}

        <h1 className="mt-8 font-black uppercase leading-none text-3xl sm:text-4xl lg:text-5xl">
          {project.name}
        </h1>

        {/* Stacks */}
        {stacks.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {stacks.map(
              (stack: { name: string; id: string } | null) =>
                stack && (
                  <Link
                    key={stack.id}
                    href={`/proyek?stack=${stack.id}`}
                    className="border-2 border-[var(--hard-border)] bg-brand-yellow px-3 py-1 font-mono text-[11px] font-bold uppercase text-black"
                  >
                    {stack.name}
                  </Link>
                ),
            )}
          </div>
        )}

        {/* Description. Markdown, like articles: the submission form tells the
            contributor to format with Markdown (src/components/ProjectForm.tsx). */}
        {project.content && (
          <Markdown className="mt-10">{project.content}</Markdown>
        )}

        {/* Links */}
        {(project.github_url || project.demo_url) && (
          <div className="mt-10 flex flex-wrap gap-3">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className={BTN_SM_WHITE}
              >
                <Icon name="github" className="size-4" />
                Lihat di GitHub
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className={BTN_SM_RED}
              >
                <Icon name="external" className="size-4" />
                Lihat Demo
              </a>
            )}
          </div>
        )}

        {/* Contributors */}
        {contributors && contributors.length > 0 && (
          <div className={`${HARD_CARD} mt-10 bg-surface-2 p-6`}>
            <h2 className="font-black uppercase text-lg">Kontributor</h2>
            <ul className="mt-5 flex flex-col gap-4">
              {contributors.map((c: {
                user_id: string;
                users: {
                  fullname?: string | null;
                  username?: string | null;
                  image_url?: string | null;
                }[];
              }) => {
                const user = oneRelation(c.users);
                const name = user?.fullname || user?.username || "Anggota";

                return (
                  <li key={c.user_id} className="flex items-center gap-3">
                    {user?.image_url ? (
                      <Image
                        src={user.image_url}
                        alt={name}
                        width={36}
                        height={36}
                        className="size-9 border-2 border-[var(--hard-border)] object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="flex size-9 items-center justify-center border-2 border-[var(--hard-border)] bg-brand-yellow font-mono text-xs font-bold text-black"
                      >
                        {initials(name)}
                      </span>
                    )}
                    <div>
                      <p className="font-bold text-sm text-foreground">{name}</p>
                      {user?.username && (
                        <p className="font-mono text-xs text-muted">
                          @{user.username}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
