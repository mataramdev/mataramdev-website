import { createClient } from "@/lib/supabase/server";
import {
  BTN_SM_RED,
  CONTAINER,
  FilterChip,
  HARD_CARD,
  NEO_BADGE,
  PageHeader,
  RESOURCE_TAG,
  SectionEmpty,
} from "@/components/ui/brutalist";
import {
  RESOURCE_CATEGORIES,
  RESOURCE_CATEGORY_LABELS,
  isResourceCategory,
  resourceCategoryLabel,
  resourceFallbackIcon,
} from "@/lib/resourceCategory";
import Icon from "@/components/ui/icons";

export const metadata = {
  title: "Resource Gratis — Mataram Dev",
  description:
    "Kumpulan cheatsheet, template, dan materi belajar gratis dari komunitas Mataram Dev.",
};

interface ResourceListRow {
  id: string;
  name: string;
  icon: string | null;
  category: string;
  download_count: number | null;
}

interface ResourceCenterPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ResourceCenterPage({
  searchParams,
}: ResourceCenterPageProps) {
  const params = await searchParams;
  const categoryParam =
    typeof params.kategori === "string" ? params.kategori : undefined;
  const activeCategory = isResourceCategory(categoryParam)
    ? categoryParam
    : null;

  const supabase = await createClient();

  const query = supabase
    .from("free_resources")
    .select("id, name, icon, category, download_count")
    .order("created_at", { ascending: false });

  const { data, error } = activeCategory
    ? await query.eq("category", activeCategory)
    : await query;

  if (error) {
    throw new Error(`Gagal mengambil data resource: ${error.message}`);
  }

  const resources = (data || []) as unknown as ResourceListRow[];

  const filters: { label: string; value: string | null }[] = [
    { label: "Semua", value: null },
    ...RESOURCE_CATEGORIES.map((category) => ({
      label: RESOURCE_CATEGORY_LABELS[category],
      value: category as string,
    })),
  ];

  return (
    <div className="bg-background py-16 sm:py-24">
      <div className={CONTAINER}>
        <PageHeader
          badge="Open Source"
          title="Resource Gratis"
          description="Cheatsheet, template, dan materi belajar yang dibagikan gratis oleh anggota komunitas. Unduh langsung tanpa perlu daftar akun."
        />

        <nav className="mt-8 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <FilterChip
              key={filter.label}
              href={
                filter.value
                  ? `/resource?kategori=${filter.value}`
                  : "/resource"
              }
              active={activeCategory === filter.value}
            >
              {filter.label}
            </FilterChip>
          ))}
        </nav>

        {resources.length === 0 ? (
          <SectionEmpty>
            {activeCategory
              ? `Belum ada resource kategori "${resourceCategoryLabel(activeCategory)}".`
              : "Belum ada resource yang dibagikan. Nantikan ya!"}
          </SectionEmpty>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className={`${HARD_CARD} flex h-full flex-col bg-surface-2 p-5`}
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-11 shrink-0 items-center justify-center border-2 border-[var(--hard-border)] bg-brand-yellow text-2xl"
                  >
                    {resource.icon ? (
                      resource.icon
                    ) : (
                      <Icon
                        name={resourceFallbackIcon(resource.category)}
                        className="size-6"
                      />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h2 className="font-black uppercase leading-tight text-base">
                      {resource.name}
                    </h2>
                    <span
                      className={`${NEO_BADGE} mt-2 text-white ${
                        RESOURCE_TAG[resource.category] ?? "bg-zinc-500"
                      }`}
                    >
                      {resourceCategoryLabel(resource.category)}
                    </span>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                  <span className="font-mono text-xs text-muted">
                    {resource.download_count ?? 0} unduhan
                  </span>
                  <a
                    href={`/resource/${resource.id}/download`}
                    className={BTN_SM_RED}
                  >
                    Unduh
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
