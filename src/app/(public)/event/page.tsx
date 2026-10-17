import { createClient } from "@/lib/supabase/server";
import { EventCard } from "@/components/cards";
import { CONTAINER, FilterChip, PageHeader, SectionEmpty } from "@/components/ui/brutalist";
import {
  EVENT_STATUSES,
  EVENT_STATUS_LABELS,
  eventStatusLabel,
  isEventStatus,
  type EventStatus,
} from "@/lib/eventStatus";

export const metadata = {
  title: "Event — Mataram Dev",
  description:
    "Workshop, sharing session, dan kopdar komunitas developer & designer Mataram.",
};

interface EventListPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface EventRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  status: string;
  start_time: string | null;
  end_time: string | null;
  location_name: string | null;
}

const STATUS_FILTERS: { label: string; value: EventStatus | null }[] = [
  { label: "Semua", value: null },
  ...EVENT_STATUSES.map((status) => ({
    label: EVENT_STATUS_LABELS[status],
    value: status,
  })),
];

export default async function EventListPage({
  searchParams,
}: EventListPageProps) {
  const params = await searchParams;
  const statusParam =
    typeof params.status === "string" ? params.status : undefined;
  const activeStatus = isEventStatus(statusParam) ? statusParam : null;

  const supabase = await createClient();

  const query = supabase
    .from("events")
    .select(
      "id, slug, title, excerpt, image_url, status, start_time, end_time, location_name",
    )
    .order("start_time", { ascending: true, nullsFirst: false });

  const { data, error } = activeStatus
    ? await query.eq("status", activeStatus)
    : await query;

  if (error) {
    throw new Error(`Gagal mengambil data event: ${error.message}`);
  }

  const events = (data ?? []) as unknown as EventRow[];

  return (
    <div className="bg-background py-16 sm:py-24">
      <div className={CONTAINER}>
        <PageHeader
          badge="Daftar Event"
          title="Event Komunitas"
          description="Workshop, sharing session, dan kopdar dari developer & designer Mataram."
        />

        <nav className="mt-8 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <FilterChip
              key={filter.label}
              href={filter.value ? `/event?status=${filter.value}` : "/event"}
              active={activeStatus === filter.value}
            >
              {filter.label}
            </FilterChip>
          ))}
        </nav>

        {events.length === 0 ? (
          <SectionEmpty>
            {activeStatus
              ? `Belum ada event dengan status "${eventStatusLabel(activeStatus)}".`
              : "Belum ada event. Pantau terus ya!"}
          </SectionEmpty>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={{
                  slug: event.slug,
                  title: event.title,
                  excerpt: event.excerpt,
                  imageUrl: event.image_url,
                  status: event.status,
                  startTime: event.start_time,
                  endTime: event.end_time,
                  locationName: event.location_name,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
