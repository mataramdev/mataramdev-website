"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { communitySettingsSchema } from "@/lib/validations/community";
import {
  LOGO_MAX_FILE_MB,
  SETTINGS_BUCKET,
  storagePathFromPublicUrl,
} from "@/lib/storage";
import type { ActionResult } from "@/types";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** Keeps the stored object name readable instead of trusting the raw filename. */
function safeFileName(originalName: string): string {
  const cleaned = originalName
    .toLowerCase()
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned.length > 0 ? cleaned : "logo";
}

/** Best-effort delete of a logo object we are replacing or clearing. */
async function removeLogoObject(supabase: Supabase, url: string | null) {
  if (!url) return;

  const path = storagePathFromPublicUrl(url, SETTINGS_BUCKET);
  if (!path) return;

  const { error } = await supabase.storage.from(SETTINGS_BUCKET).remove([path]);
  if (error) {
    // The new URL is already saved; a leftover object is untidy but harmless,
    // so this must not fail the whole save.
    console.error("[updateCommunitySettings] gagal menghapus logo lama:", error);
  }
}

/**
 * Resolves one logo field (Task 9.3 / PRD §4.7).
 *
 * Three outcomes: a freshly uploaded URL, the current URL unchanged, or null
 * when the admin ticked the remove box. Anything else is an error message.
 */
async function resolveLogo(
  supabase: Supabase,
  file: FormDataEntryValue | null,
  remove: boolean,
  current: string | null,
  label: string
): Promise<{ url: string | null } | { error: string }> {
  const hasFile = file instanceof File && file.size > 0;

  if (remove && !hasFile) {
    await removeLogoObject(supabase, current);
    return { url: null };
  }

  if (!hasFile) {
    return { url: current };
  }

  if (file.type && !file.type.startsWith("image/")) {
    return { error: `${label} harus berupa gambar` };
  }

  const maxBytes = LOGO_MAX_FILE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { error: `Ukuran ${label} maksimal ${LOGO_MAX_FILE_MB}MB` };
  }

  const path = `logos/${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}-${safeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(SETTINGS_BUCKET)
    .upload(path, file);

  if (uploadError) {
    return { error: `Gagal mengunggah ${label}` };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(SETTINGS_BUCKET).getPublicUrl(path);

  await removeLogoObject(supabase, current);

  return { url: publicUrl };
}

export async function updateCommunitySettings(
  _prevState: ActionResult<null>,
  formData: FormData
): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Hanya admin yang bisa mengakses" };
  }

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    keywords: (formData.get("keywords") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    mapsLocation: (formData.get("mapsLocation") as string) || undefined,
  };

  const validated = communitySettingsSchema.safeParse(raw);
  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message || "Validasi gagal";
    return { success: false, error: firstError };
  }

  // Parse keywords from comma-separated string
  const keywords = validated.data.keywords
    ? validated.data.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : null;

  // Read the current row first: it is both the singleton target and the source
  // of the existing logo URLs (needed to clean up replaced objects).
  const { data: existing, error: readError } = await supabase
    .from("community_settings")
    .select("id, light_logo_url, dark_logo_url")
    .limit(1)
    .maybeSingle();

  if (readError) {
    return { success: false, error: "Gagal membaca pengaturan" };
  }

  const light = await resolveLogo(
    supabase,
    formData.get("lightLogo"),
    formData.get("removeLightLogo") === "on",
    existing?.light_logo_url ?? null,
    "logo terang"
  );
  if ("error" in light) {
    return { success: false, error: light.error };
  }

  const dark = await resolveLogo(
    supabase,
    formData.get("darkLogo"),
    formData.get("removeDarkLogo") === "on",
    existing?.dark_logo_url ?? null,
    "logo gelap"
  );
  if ("error" in dark) {
    return { success: false, error: dark.error };
  }

  const payload = {
    name: validated.data.name,
    description: validated.data.description || null,
    keywords,
    address: validated.data.address || null,
    maps_location: validated.data.mapsLocation || null,
    light_logo_url: light.url,
    dark_logo_url: dark.url,
  };

  if (existing) {
    const { error } = await supabase
      .from("community_settings")
      .update(payload)
      .eq("id", existing.id);

    if (error) {
      return { success: false, error: "Gagal memperbarui pengaturan" };
    }
  } else {
    const { error } = await supabase.from("community_settings").insert(payload);

    if (error) {
      return { success: false, error: "Gagal membuat pengaturan" };
    }
  }

  revalidatePath("/admin/pengaturan");
  revalidatePath("/", "layout"); // Navbar/Footer logo live in the root layout
  return { success: true, data: null };
}
