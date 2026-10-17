import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isUuid, oneRelation } from "@/lib/utils";
import { ProjectCard, type CardMeta } from "@/components/cards";
import {
  BTN_SM_RED,
  CONTAINER,
  FilterChip,
  PageHeader,
  SectionEmpty,
} from "@/components/ui/brutalist";

export const metadata = {
  title: "Proyek Komunitas — Mataram Dev",
  description:
    "Lihat proyek dan karya dari developer & designer komunitas Mataram.",
};

interface ProjectListPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface ProjectListRow {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  github_url: string | null;
  demo_url: string | null;
  project_stacks: { stacks: { name: string } | null }[] | null;
}

export default async function ProjectListPage({
  searchParams,
}: ProjectListPageProps) {
  const params = await searchParams;
  // A malformed id is ignored, like the other list pages ignore an unknown
  // filter value — a hand-typed `?stack=abc` must not 500 the page.
  const stackParam =
    typeof params.stack === "string" && isUuid(params.stack)
      ? params.stack
      : undefined;

  const supabase = await createClient();

  // Fetch all stacks (for filter buttons)
  const { data: allStacks } = await supabase
    .from("stacks")
    .select("id, name")
    .order("name");

  // Filter by stack: the matching project ids come from a separate query.
  // PostgREST refuses `contains("project_stacks.stack_id", …)` (PGRST108 —
  // `project_stacks` is a to-many embed, not a column of `projects`), so the
  // join table is read on its own and the parent rows are filtered by id.
  let stackProjectIds: string[] | null = null;
  if (stackParam) {
    const { data: stackRows, error: stackError } = await supabase
      .from("project_stacks")
      .select("project_id")
      .eq("stack_id", stackParam);

    if (stackError) {
      throw new Error(
        `Gagal memfilter proyek berdasarkan stack: ${stackError.message}`,
      );
    }

    stackProjectIds = (stackRows ?? []).map((row) => row.project_id);
  }

  // Build project query — only approved projects
  const query = supabase
    .from("projects")
    .select(
      "id, slug, name, image_url, github_url, demo_url, created_at, project_stacks(stack_id, stacks(name))",
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  // `id=in.()` matches nothing, which is the right answer for a stack no
  // project uses yet.
  const { data, error } = stackProjectIds
    ? await query.in("id", stackProjectIds)
    : await query;

  if (error) {
    throw new Error(`Gagal mengambil data proyek: ${error.message}`);
  }

  const projects = (data ?? []) as unknown as ProjectListRow[];

  // Fetch contributor counts for all displayed projects
  const contributorCounts: Record<string, number> = {};
  if (projects.length > 0) {
    const projectIds = projects.map((p) => p.id);
    const { data: contribData } = await supabase
      .from("project_contributors")
      .select("project_id")
      .in("project_id", projectIds);

    if (contribData) {
      for (const c of contribData) {
        contributorCounts[c.project_id] =
          (contributorCounts[c.project_id] || 0) + 1;
      }
    }
  }

  return (
    <div className="bg-background py-16 sm:py-24">
      <div className={CONTAINER}>
        <PageHeader
          badge="Showcase"
          title="Proyek Komunitas"
          description="Karya dan proyek dari developer & designer Mataram."
          actions={
            <Link href="/proyek/baru" className={BTN_SM_RED}>
              + Kirim Proyek
            </Link>
          }
        />

        {/* Stack filter */}
        {allStacks && allStacks.length > 0 && (
          <nav className="mt-8 flex flex-wrap gap-2">
            <FilterChip href="/proyek" active={!stackParam}>
              Semua
            </FilterChip>
            {allStacks.map((stack) => (
              <FilterChip
                key={stack.id}
                href={`/proyek?stack=${stack.id}`}
                active={stackParam === stack.id}
              >
                {stack.name}
              </FilterChip>
            ))}
          </nav>
        )}

        {/* Project grid */}
        {projects.length === 0 ? (
          <div className="mt-8">
            <SectionEmpty>
              {stackParam
                ? "Tidak ada proyek dengan stack ini."
                : "Belum ada proyek yang disetujui. Kirim proyek pertama kamu!"}
            </SectionEmpty>
            <div className="mt-6 flex justify-center">
              <Link href="/proyek/baru" className={BTN_SM_RED}>
                Kirim Proyek
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const stackNames = (project.project_stacks ?? [])
                .map((ps) => oneRelation(ps.stacks)?.name)
                .filter((name): name is string => Boolean(name));

              const meta: CardMeta[] = [];
              const count = contributorCounts[project.id];
              if (count) meta.push({ icon: "users", label: `${count} kontributor` });
              if (project.github_url) meta.push({ icon: "github", label: "GitHub" });
              if (project.demo_url) meta.push({ icon: "external", label: "Demo" });

              return (
                <ProjectCard
                  key={project.id}
                  project={{
                    slug: project.slug,
                    name: project.name,
                    content: null,
                    imageUrl: project.image_url,
                    stackNames,
                    meta,
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
