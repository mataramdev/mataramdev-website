/**
 * Shared event status vocabulary.
 *
 * The admin management list and the public discovery pages render the same
 * labels and colours, so they live here instead of being copied per page.
 */

export const EVENT_STATUSES = [
  "upcoming",
  "ongoing",
  "completed",
  "cancelled",
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  upcoming: "Akan Datang",
  ongoing: "Berlangsung",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

/**
 * Badge neo-brutalist: teks putih di atas isian solid, semuanya ≥4,5:1
 * (teal 6,15:1 · merah gelap 4,98:1 · abu 5,0:1 · hampir hitam 17:1).
 */
export const EVENT_STATUS_BADGE_CLASSES: Record<EventStatus, string> = {
  upcoming: "border-2 border-[var(--hard-border)] bg-teal-500 text-white",
  ongoing: "border-2 border-[var(--hard-border)] bg-accent-700 text-white",
  completed: "border-2 border-[var(--hard-border)] bg-zinc-500 text-white",
  cancelled: "border-2 border-[var(--hard-border)] bg-brand-ink text-white",
};

export function isEventStatus(value: string | undefined): value is EventStatus {
  return EVENT_STATUSES.includes(value as EventStatus);
}

/** Falls back to the raw value for statuses this build does not know about. */
export function eventStatusLabel(status: string): string {
  return isEventStatus(status) ? EVENT_STATUS_LABELS[status] : status;
}

export function eventStatusBadgeClasses(status: string): string {
  return isEventStatus(status) ? EVENT_STATUS_BADGE_CLASSES[status] : "";
}
