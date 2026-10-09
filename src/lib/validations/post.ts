import { z } from "zod";
import { POST_CATEGORIES, POST_STATUSES } from "@/lib/postStatus";

export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Judul harus minimal 3 karakter")
    .max(200, "Judul maksimal 200 karakter"),
  excerpt: z
    .string()
    .trim()
    .max(300, "Ringkasan maksimal 300 karakter")
    .optional(),
  content: z
    .string()
    .trim()
    .min(50, "Isi artikel minimal 50 karakter")
    .max(50000, "Isi artikel maksimal 50.000 karakter"),
  category: z.enum(POST_CATEGORIES, {
    error: "Pilih kategori artikel",
  }),
  // Comma-separated in the form; parsed to `string[]` by the server action.
  tags: z.string().max(200, "Tag terlalu panjang").optional(),
  status: z.enum(POST_STATUSES),
});

export type PostInput = z.infer<typeof postSchema>;

/**
 * Turns the comma-separated input into a clean tag list (Task 9.6).
 * Deduplicates case-insensitively, trims, drops empties, caps at 5 tags of
 * 24 characters so one field cannot store an unbounded array.
 */
export function parseTags(raw: string | undefined): string[] | null {
  if (!raw) return null;

  const seen = new Set<string>();
  const tags: string[] = [];

  for (const part of raw.split(",")) {
    const tag = part.trim().slice(0, 24);
    if (!tag) continue;

    const key = tag.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    tags.push(tag);
    if (tags.length >= 5) break;
  }

  return tags.length > 0 ? tags : null;
}
