/**
 * Shared project moderation status vocabulary.
 *
 * The admin moderation queue and the public showcase render the same labels
 * and colours, so they live here instead of being copied per page.
 */

export const PROJECT_STATUSES = ["pending", "approved", "rejected"] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  pending: "Menunggu Review",
  approved: "Disetujui",
  rejected: "Ditolak",
};

/**
 * Badge neo-brutalist: border 2px + warna solid + teks yang lolos kontras
 * (langkah, bukan pill) — dipakai tabel dashboard & antrian moderasi admin.
 */
export const PROJECT_STATUS_BADGE_CLASSES: Record<ProjectStatus, string> = {
  pending: "border-2 border-[var(--hard-border)] bg-brand-gold text-black",
  approved: "border-2 border-[var(--hard-border)] bg-brand-green text-white",
  rejected: "border-2 border-[var(--hard-border)] bg-accent-500 text-white",
};

export function isProjectStatus(value: string | undefined): value is ProjectStatus {
  return PROJECT_STATUSES.includes(value as ProjectStatus);
}

/** Falls back to the raw value for statuses this build does not know about. */
export function projectStatusLabel(status: string): string {
  return isProjectStatus(status) ? PROJECT_STATUS_LABELS[status] : status;
}

export function projectStatusBadgeClasses(status: string): string {
  return isProjectStatus(status) ? PROJECT_STATUS_BADGE_CLASSES[status] : "";
}
