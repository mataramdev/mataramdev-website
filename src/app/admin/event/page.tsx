import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import {
  eventStatusBadgeClasses,
  eventStatusLabel,
} from "@/lib/eventStatus";
import DeleteEventButton from "./DeleteEventButton";

export default async function AdminEventsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-black uppercase leading-none text-2xl">
            Kelola Event
          </h1>
          <p className="mt-1 text-sm text-muted">
            {events?.length || 0} event terdaftar.
          </p>
        </div>
        <Link
          href="/admin/event/baru"
          className="rounded-btn bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600"
        >
          + Buat Event
        </Link>
      </div>

      {(!events || events.length === 0) ? (
        <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-12 text-center dark:border-[var(--hard-border)] dark:bg-surface-2">
          <p className="text-muted">
            Belum ada event. Yuk buat event pertama!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-4 dark:border-[var(--hard-border)] dark:bg-surface-2"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-black uppercase text-sm">
                    {event.title}
                  </h3>
                  <span
                    className={`inline-flex shrink-0 items-center px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${eventStatusBadgeClasses(event.status)}`}
                  >
                    {eventStatusLabel(event.status)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {formatDate(event.start_time)}
                  {event.location_name && ` • ${event.location_name}`}
                </p>
              </div>

              <div className="ml-4 flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/event/${event.id}/edit`}
                  className="rounded-btn border-[3px] border-[var(--hard-border)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-3 dark:border-[var(--hard-border)] dark:text-foreground dark:hover:bg-surface-3"
                >
                  Edit
                </Link>
                <DeleteEventButton eventId={event.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
