import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Public branding fields from the `community_settings` singleton.
 *
 * `cache()` dedupes this across the root layout and its `generateMetadata`
 * within one request, so Navbar/Footer and the default OG image share a single
 * query (Task 9.4).
 */
export interface CommunityBranding {
  name: string;
  description: string | null;
  lightLogoUrl: string | null;
  darkLogoUrl: string | null;
}

const FALLBACK: CommunityBranding = {
  name: "Mataram Dev",
  description: null,
  lightLogoUrl: null,
  darkLogoUrl: null,
};

export const getCommunityBranding = cache(
  async (): Promise<CommunityBranding> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("community_settings")
      .select("name, description, light_logo_url, dark_logo_url")
      .limit(1)
      .maybeSingle();

    if (error) {
      // A branding read failure must not take pages down — fall back to the
      // text wordmark. Logged so the cause is not swallowed silently.
      console.error("[getCommunityBranding] gagal memuat pengaturan:", error);
      return FALLBACK;
    }

    return {
      name: data?.name || FALLBACK.name,
      description: data?.description ?? null,
      lightLogoUrl: data?.light_logo_url ?? null,
      darkLogoUrl: data?.dark_logo_url ?? null,
    };
  }
);
