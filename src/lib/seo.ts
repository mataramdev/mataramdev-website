/**
 * Shared SEO helpers (Task 9.4 / PRD §5).
 *
 * Detail pages build their own `generateMetadata` from real row data; these
 * helpers keep the site origin and the text trimming in one place so the
 * canonical URLs and OG images match across pages.
 */

/**
 * Public site origin, used for `metadataBase`, canonical URLs and OG images.
 *
 * Order: explicit `NEXT_PUBLIC_SITE_URL` (set this in production), then the
 * deployment URL Vercel injects, then localhost for development. Values are
 * read with static `process.env.X` lookups so Next.js can inline the public
 * one at build time.
 */
export function getSiteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    try {
      return new URL(explicit);
    } catch {
      // Malformed value: fall through to the deployment/localhost defaults
      // rather than crashing every page's metadata.
    }
  }

  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }

  return new URL("http://localhost:3000");
}

/**
 * Trims arbitrary body text into a one-line meta description.
 *
 * Markdown/code fences would otherwise leak `#` and backticks straight into the
 * search result and social card.
 */
export function toMetaDescription(
  text: string | null | undefined,
  maxLength = 160
): string | undefined {
  if (!text) return undefined;

  const cleaned = text
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks
    .replace(/[#>*_`]/g, " ") // markdown punctuation
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // [label](url) → label
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length === 0) return undefined;
  if (cleaned.length <= maxLength) return cleaned;

  const clipped = cleaned.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > maxLength * 0.6 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}
