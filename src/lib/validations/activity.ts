import { z } from "zod";

/**
 * Community activities (Task 9.7 / PRD §3.1) — the cards shown on the landing
 * page describing what the community does.
 */
export const activitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama aktivitas minimal 2 karakter")
    .max(80, "Nama aktivitas maksimal 80 karakter"),
  description: z
    .string()
    .trim()
    .max(300, "Deskripsi maksimal 300 karakter")
    .optional(),
  icon: z.string().trim().max(8, "Ikon maksimal 8 karakter").optional(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Warna harus format hex, contoh #3b82f6")
    .optional()
    .or(z.literal("")),
});

export type ActivityInput = z.infer<typeof activitySchema>;
