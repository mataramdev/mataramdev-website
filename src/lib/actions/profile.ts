"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  profileSchema,
  socialLinkSchema,
} from "@/lib/validations/profile";
import type { ActionResult } from "@/types";

export async function updateProfile(
  _prevState: ActionResult<null>,
  formData: FormData
): Promise<ActionResult<null>> {
  const raw = {
    fullname: formData.get("fullname") as string,
    username: formData.get("username") as string,
    bio: (formData.get("bio") as string) || undefined,
  };

  const validated = profileSchema.safeParse(raw);
  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message || "Validasi gagal";
    return { success: false, error: firstError };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  // Check if username is already taken by another user
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("username", validated.data.username)
    .neq("id", user.id)
    .single();

  if (existingUser) {
    return { success: false, error: "Username sudah digunakan" };
  }

  const { error } = await supabase
    .from("users")
    .update({
      fullname: validated.data.fullname,
      username: validated.data.username,
      bio: validated.data.bio || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: "Gagal memperbarui profil" };
  }

  revalidatePath("/profil");
  return { success: true, data: null };
}

export async function addSocialLink(
  _prevState: ActionResult<null>,
  formData: FormData
): Promise<ActionResult<null>> {
  const raw = {
    platform: formData.get("platform") as string,
    url: formData.get("url") as string,
  };

  const validated = socialLinkSchema.safeParse(raw);
  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message || "Validasi gagal";
    return { success: false, error: firstError };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  const { error } = await supabase.from("social_links").insert({
    owner_type: "user",
    owner_id: user.id,
    platform: validated.data.platform,
    url: validated.data.url,
  });

  if (error) {
    return { success: false, error: "Gagal menambahkan link sosial" };
  }

  revalidatePath("/profil");
  return { success: true, data: null };
}

export async function removeSocialLink(
  linkId: string
): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  const { error } = await supabase
    .from("social_links")
    .delete()
    .eq("id", linkId)
    .eq("owner_id", user.id);

  if (error) {
    return { success: false, error: "Gagal menghapus link sosial" };
  }

  revalidatePath("/profil");
  return { success: true, data: null };
}
