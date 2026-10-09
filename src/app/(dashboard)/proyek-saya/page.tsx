import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, oneRelation } from "@/lib/utils";
import {
  PROJECT_STATUSES,
  projectStatusBadgeClasses,
  projectStatusLabel,
  type ProjectStatus,
} from "@/lib/projectStatus";
import Icon from "@/components/ui/icons";

export const metadata = {
  title: "Proyek Saya — Mataram Dev",
  description: "Status review proyek yang kamu kirim ke komunitas.",
};

interface MyProjectRow {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  content: string | null;
  status: string;
  created_at: string;
  project_stacks: { stacks: { name: string }[] | null }[] | null;
  project_contributors: { user_id: string }[] | null;
}

interface MyProjectsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MyProjectsPage({
  searchParams,
}: MyProjectsPageProps) {
  const params = await searchParams;
  const justSubmitted = params.submitted === "1";

  const requested = typeof params.status === "string" ? params.status : undefined;
  const activeFilter: ProjectStatus | "all" =
    requested === "all" ||
    (requested && PROJECT_STATUSES.includes(requested as ProjectStatus))
      ? (requested as ProjectStatus | "all")
      : "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Projects this user contributed to (the submitter is added automatically).
  const { data: contributions, error: contributionsError } = await supabase
    .from("project_contributors")
    .select("project_id")
    .eq("user_id", user.id);

  if (contributionsError) {
    throw new Error(
      `Gagal mengambil data proyek Anda: ${contributionsError.message}`
    );
  }

  const projectIds = (contributions || []).map((c) => c.project_id);

  let projects: MyProjectRow[] = [];

  if (projectIds.length > 0) {
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, slug, name, image_url, content, status, created_at, project_stacks(stacks(name)), project_contributors(user_id)"
      )
      .in("id", projectIds)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Gagal mengambil data proyek Anda: ${error.message}`);
    }

    projects = (data || []) as unknown as MyProjectRow[];
  }

  const counts = { all: projects.length, pending: 0, approved: 0, rejected: 0 };
  for (const project of projects) {
    if (PROJECT_STATUSES.includes(project.status as ProjectStatus)) {
      counts[project.status as ProjectStatus] += 1;
    }
  }

  const visible =
    activeFilter === "all"
      ? projects
      : projects.filter((project) => project.status === activeFilter);

  const tabs: { key: ProjectStatus | "all"; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "pending", label: "Menunggu Review" },
    { key: "approved", label: "Disetujui" },
    { key: "rejected", label: "Ditolak" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-black uppercase leading-none text-2xl">
            Proyek Saya
          </h1>
          <p className="mt-1 text-sm text-muted">
            Status review proyek yang kamu kirim ke komunitas.
          </p>
        </div>
        <Link
          href="/proyek/baru"
          className="rounded-btn bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600"
        >
          + Kirim Proyek
        </Link>
      </div>

      {justSubmitted && (
        <div className="rounded-card border border-[var(--hard-border)] bg-brand-green p-4 dark:border-[var(--hard-border)] dark:bg-brand-green">
          <p className="text-sm font-medium text-white">
            Proyek berhasil dikirim!
          </p>
          <p className="mt-1 text-sm text-white/90">
            Proyek kamu sedang menunggu review admin. Setelah disetujui, proyek
            akan tampil di halaman Proyek komunitas.
          </p>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-12 text-center dark:border-[var(--hard-border)] dark:bg-surface-2">
          <p className="text-muted">
            Kamu belum mengirim proyek apa pun.
          </p>
          <Link
            href="/proyek/baru"
            className="mt-4 inline-block rounded-btn bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600"
          >
            Kirim Proyek Pertama
          </Link>
        </div>
      ) : (
        <>
          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Link
                key={tab.key}
                href={`/proyek-saya?status=${tab.key}`}
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
                  ? "Belum ada proyek."
                  : `Tidak ada proyek berstatus "${projectStatusLabel(activeFilter)}".`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((project) => {
                const stackNames =
                  project.project_stacks
                    ?.map((ps) => oneRelation(ps.stacks)?.name)
                    .filter(Boolean) || [];

                const contributorCount =
                  project.project_contributors?.length ?? 0;

                const isApproved = project.status === "approved";

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
                        {isApproved ? (
                          <Link
                            href={`/proyek/${project.slug}`}
                            className="truncate font-black uppercase text-sm hover:text-teal-600 dark:text-foreground dark:hover:text-teal-300"
                          >
                            {project.name}
                          </Link>
                        ) : (
                          <span className="truncate font-black uppercase text-sm">
                            {project.name}
                          </span>
                        )}
                        <span
                          className={`inline-flex shrink-0 items-center px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${projectStatusBadgeClasses(project.status)}`}
                        >
                          {projectStatusLabel(project.status)}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-muted">
                        Dikirim {formatDate(project.created_at)}
                        {contributorCount > 0 &&
                          ` • ${contributorCount} contributor`}
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

                      {project.status === "rejected" && (
                        <p className="mt-2 text-xs text-accent-600 dark:text-accent-400">
                          Proyek ini tidak lolos review, jadi tidak tampil di
                          halaman publik. Hubungi admin untuk tahu alasannya.
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      {isApproved ? (
                        <Link
                          href={`/proyek/${project.slug}`}
                          className="rounded-btn border-[3px] border-[var(--hard-border)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-3 dark:border-[var(--hard-border)] dark:text-foreground dark:hover:bg-surface-3"
                        >
                          Lihat
                        </Link>
                      ) : (
                        <span
                          className="cursor-not-allowed rounded-btn border-[3px] border-[var(--hard-border)] px-3 py-1.5 text-xs font-medium text-muted dark:border-[var(--hard-border)] dark:text-muted"
                          title="Belum tampil di halaman publik"
                        >
                          Belum publik
                        </span>
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
