/**
 * Shared post (article) vocabulary.
 *
 * The author-facing pages, the admin list and the public blog render the same
 * labels and colours, so they live here instead of being copied per page.
 */

export const POST_STATUSES = ["draft", "published"] as const;

export type PostStatus = (typeof POST_STATUSES)[number];

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  draft: "Draf",
  published: "Terbit",
};

/** Badge neo-brutalist (border 2px + warna solid), sama seperti status lain. */
export const POST_STATUS_BADGE_CLASSES: Record<PostStatus, string> = {
  draft: "border-2 border-[var(--hard-border)] bg-brand-gold text-black",
  published: "border-2 border-[var(--hard-border)] bg-brand-green text-white",
};

export function isPostStatus(value: string | undefined): value is PostStatus {
  return POST_STATUSES.includes(value as PostStatus);
}

/** Falls back to the raw value for statuses this build does not know about. */
export function postStatusLabel(status: string): string {
  return isPostStatus(status) ? POST_STATUS_LABELS[status] : status;
}

export function postStatusBadgeClasses(status: string): string {
  return isPostStatus(status) ? POST_STATUS_BADGE_CLASSES[status] : "";
}

/**
 * Article categories. Kept as a fixed set (instead of free text) so the public
 * filter chips and the admin list always agree on the vocabulary.
 */
export const POST_CATEGORIES = ["tutorial", "tips", "event", "story"] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  tutorial: "Tutorial",
  tips: "Tips",
  event: "Event",
  story: "Cerita",
};

export function isPostCategory(
  value: string | undefined,
): value is PostCategory {
  return POST_CATEGORIES.includes(value as PostCategory);
}

/** Falls back to the raw value for categories this build does not know about. */
export function postCategoryLabel(category: string): string {
  return isPostCategory(category) ? POST_CATEGORY_LABELS[category] : category;
}
