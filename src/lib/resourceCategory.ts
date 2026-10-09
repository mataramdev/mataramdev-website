/**
 * Shared resource vocabulary.
 *
 * The admin list and the public download center render the same labels,
 * colours and fallback icons, so they live here instead of being copied per
 * page. Mirrors `eventStatus.ts` / `projectStatus.ts` / `postStatus.ts`.
 */

import type { IconName } from "@/components/ui/icons";

export const RESOURCE_CATEGORIES = ["code", "doc", "design", "video"] as const;

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategory, string> = {
  code: "Kode",
  doc: "Dokumen",
  design: "Desain",
  video: "Video",
};

/** Badge neo-brutalist (border 2px + warna solid), sama seperti status lain. */
export const RESOURCE_CATEGORY_BADGE_CLASSES: Record<ResourceCategory, string> =
  {
    code: "border-2 border-[var(--hard-border)] bg-brand-green text-white",
    doc: "border-2 border-[var(--hard-border)] bg-brand-blue text-white",
    design: "border-2 border-[var(--hard-border)] bg-brand-purple text-white",
    video: "border-2 border-[var(--hard-border)] bg-brand-orange text-white",
  };

/** Used when an admin uploads a resource without picking a custom icon. */
export const RESOURCE_CATEGORY_ICONS: Record<ResourceCategory, string> = {
  code: "💻",
  doc: "📄",
  design: "🎨",
  video: "🎬",
};
/**
 * Ikon SVG pengganti emoji di atas (lihat `src/components/ui/icons.tsx`).
 * Emoji tetap didukung karena admin boleh mengisi kolom `icon` sendiri — yang
 * diganti hanya default supaya tampilannya konsisten antar-OS dan bisa
 * diwarnai.
 */
export const RESOURCE_FALLBACK_ICON: Record<ResourceCategory, IconName> = {
  code: "code",
  doc: "book",
  design: "palette",
  video: "video",
};

export function isResourceCategory(
  value: string | undefined
): value is ResourceCategory {
  return RESOURCE_CATEGORIES.includes(value as ResourceCategory);
}

/** Falls back to the raw value for categories this build does not know about. */
export function resourceCategoryLabel(category: string): string {
  return isResourceCategory(category)
    ? RESOURCE_CATEGORY_LABELS[category]
    : category;
}

export function resourceCategoryBadgeClasses(category: string): string {
  return isResourceCategory(category)
    ? RESOURCE_CATEGORY_BADGE_CLASSES[category]
    : "";
}

/** The uploaded `icon` wins; otherwise fall back to the category's icon. */
export function resourceIcon(category: string, icon: string | null): string {
  if (icon && icon.trim().length > 0) return icon;
  return isResourceCategory(category) ? RESOURCE_CATEGORY_ICONS[category] : "📦";
}

/**
 * Ikon SVG bawaan kategori — dipakai hanya saat admin belum mengisi `icon`.
 * Kategori tak dikenal memakai `package` (bawaan umum).
 */
export function resourceFallbackIcon(category: string): IconName {
  return isResourceCategory(category)
    ? RESOURCE_FALLBACK_ICON[category]
    : "package";
}
