/**
 * Convert a string to a URL-friendly slug.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Generate a unique slug by appending a short random suffix if needed.
 */
export function generateUniqueSlug(text: string): string {
  const base = slugify(text);
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

/**
 * Normalises a PostgREST to-one embed (for example `users(fullname)` nested in
 * a `projects` row) into a single value.
 *
 * PostgREST answers a many-to-one relationship with one object, but the
 * generated `Database` types declare every embed as an array. Reading through
 * this helper accepts both shapes, so the pages keep working whichever way the
 * row arrives — and `select(...)?.[0]` no longer quietly yields `undefined`
 * (which rendered contributors as "Anonymous" and author names as "Anonim").
 */
export function oneRelation<T>(
  value: T | T[] | null | undefined
): T | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

/**
 * True when `value` is a UUID. Used to reject hand-typed ids in query strings
 * before they reach Postgres, which answers a 22P02 error for a malformed uuid.
 */
export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

/**
 * Format a date to Indonesian locale string.
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format a date with time.
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
