import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, oneRelation } from "@/lib/utils";
import {
  PROJECT_STATUSES,
  projectStatusBadgeClasses,
  projectStatusLabel,
  type ProjectStatus,
} from "@/lib/projectStatus";
import ModerationButtons from "./ModerationButtons";
import Icon from "@/components/ui/icons";

export const metadata = {
  title: "Moderasi Proyek — Admin",
};

interface ModerationRow {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  content: string | null;
  status: string;
  created_at: string;
  project_stacks: { stacks: { name: string }[] | null }[] | null;
  project_contributors:
    | { users: { fullname: string | null; username: string | null }[] | null }[]
    | null;
}

interface AdminProjectsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminProjectsPage({
  searchParams,
}: AdminProjectsPageProps) {
  const params = await searchParams;
  const requested = typeof params.status === "string" ? params.status : undefined;
  const activeFilter: ProjectStatus | "all" =
    requested === "all" || (requested && PROJECT_STATUSES.includes(requested as ProjectStatus))
      ? (requested as ProjectStatus | "all")
      : "pending";

  const supabase = await createClient();

  // Counts per status — same table, only the two columns we need.
  const { data: statusRows, error: countError } = await supabase
    .from("projects")
    .select("id, status");

  if (countError) {
    throw new Error(`Gagal mengambil data proyek: ${countError.message}`);
  }

  const counts = { all: 0, pending: 0, approved: 0, rejected: 0 };
  for (const row of statusRows || []) {
    counts.all += 1;
    if (PROJECT_STATUSES.includes(row.status as ProjectStatus)) {
      counts[row.status as ProjectStatus] += 1;
    }
  }

  let query = supabase
    .from("projects")
    .select(
      "id, slug, name, image_url, content, status, created_at, project_stacks(stacks(name)), project_contributors(users(fullname, username))"
    )
    .order("created_at", { ascending: false });

  if (activeFilter !== "all") {
    query = query.eq("status", activeFilter);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Gagal mengambil data proyek: ${error.message}`);
  }

  const projects = (data || []) as unknown as ModerationRow[];

  const tabs: { key: ProjectStatus | "all"; label: string }[] = [
    { key: "pending", label: "Menunggu Review" },
    { key: "approved", label: "Disetujui" },
    { key: "rejected", label: "Ditolak" },
    { key: "all", label: "Semua" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-black uppercase leading-none text-2xl">
          Moderasi Proyek
        </h1>
        <p className="mt-1 text-sm text-muted">
          {counts.pending > 0
            ? `${counts.pending} proyek menunggu review.`
            : "Tidak ada proyek yang menunggu review."}
        </p>
      </div>

      {/* Status filter */}
      <nav className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/proyek?status=${tab.key}`}
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

      {projects.length === 0 ? (
        <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-12 text-center dark:border-[var(--hard-border)] dark:bg-surface-2">
          <p className="text-muted">
            {activeFilter === "pending"
              ? "Tidak ada proyek yang menunggu review."
              : activeFilter === "all"
                ? "Belum ada proyek yang disubmit."
                : `Belum ada proyek berstatus "${projectStatusLabel(activeFilter)}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const stackNames =
              project.project_stacks
                ?.map((ps) => oneRelation(ps.stacks)?.name)
                .filter(Boolean) || [];

            const contributors =
              project.project_contributors
                ?.map((pc) => oneRelation(pc.users))
                .filter(
                  (
                    user,
                  ): user is { fullname: string | null; username: string | null } =>
                    Boolean(user),
                ) || [];

            const submitter =
              contributors[0]?.fullname ||
              (contributors[0]?.username
                ? `@${contributors[0].username}`
                : "Tidak diketahui");

            return (
              <div
                key={project.id}
                className="flex gap-4 rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-4 dark:border-[var(--hard-border)] dark:bg-surface-2"
              >
                {project.image_url ? (
                  <div className="relative hidden h-20 w-32 shrink-0 overflow-hidden rounded-btn bg-surface-3 sm:block dark:bg-surface-3">
                    <Image
                      src={project.image_url}
                      alt={project.name}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="hidden h-20 w-32 shrink-0 items-center justify-center rounded-btn bg-surface-3 text-muted sm:flex dark:bg-surface-3">
                    <Icon name="rocket" className="size-7" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/proyek/${project.slug}`}
                      className="truncate font-black uppercase text-sm hover:text-teal-600 dark:text-foreground dark:hover:text-teal-300"
                    >
                      {project.name}
                    </Link>
                    <span
                      className={`inline-flex shrink-0 items-center px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${projectStatusBadgeClasses(project.status)}`}
                    >
                      {projectStatusLabel(project.status)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted">
                    Dikirim oleh {submitter} • {formatDate(project.created_at)}
                    {contributors.length > 0 &&
                      ` • ${contributors.length} contributor`}
                  </p>

                  {stackNames.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {stackNames.map((name) => (
                        <span
                          key={name}
                          className="border-2 border-[var(--hard-border)] bg-brand-yellow px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-black dark:bg-brand-yellow dark:text-teal-300"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  <ModerationButtons
                    projectId={project.id}
                    status={project.status}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
