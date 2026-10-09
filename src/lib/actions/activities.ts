"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { activitySchema } from "@/lib/validations/activity";
import {
  moveOrderedRow,
  orderUpdates,
  sortByOrder,
  type OrderRow,
  type OrderUpdate,
} from "@/lib/ordering";
import type { ActionResult } from "@/types";

/** Activities are written in the admin list and read on the landing page. */
function revalidateActivityViews() {
  revalidatePath("/admin/aktivitas");
  revalidatePath("/");
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

type AdminContext = { supabase: SupabaseClient } | { error: string };

/** Middleware only knows whether a session exists — the role is checked here. */
async function requireAdmin(): Promise<AdminContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Anda harus login" };
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    return { error: "Gagal memverifikasi akun Anda" };
  }

  if (profile?.role !== "admin") {
    return { error: "Hanya admin yang bisa mengelola aktivitas" };
  }

  return { supabase };
}

/** Persists the renumbering computed by the shared ordering helpers. */
async function persistOrder(
  supabase: SupabaseClient,
  updates: OrderUpdate[]
): Promise<string | null> {
  if (updates.length === 0) return null;

  const results = await Promise.all(
    updates.map((update) =>
      supabase
        .from("activities")
        .update({ order: update.order })
        .eq("id", update.id)
    )
  );

  if (results.some((result) => result.error)) {
    return "Gagal menyimpan urutan aktivitas";
  }

  return null;
}

/** Reads every activity and closes any gaps or duplicates in its numbering. */
async function normalizeOrder(
  supabase: SupabaseClient
): Promise<string | null> {
  const { data, error } = await supabase
    .from("activities")
    .select("id, order");

  if (error) {
    return "Gagal membaca urutan aktivitas";
  }

  return persistOrder(supabase, orderUpdates(sortByOrder((data || []) as OrderRow[])));
}

export async function createActivity(
  _prevState: ActionResult<null>,
  formData: FormData
): Promise<ActionResult<null>> {
  const admin = await requireAdmin();
  if ("error" in admin) {
    return { success: false, error: admin.error };
  }

  const validated = activitySchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? undefined,
    icon: formData.get("icon") ?? undefined,
    color: formData.get("color") ?? undefined,
  });

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Validasi gagal",
    };
  }

  // Insert without a number first so the new row sorts last, then renumber.
  const { error } = await admin.supabase.from("activities").insert({
    name: validated.data.name,
    description: validated.data.description || null,
    icon: validated.data.icon || null,
    color: validated.data.color || null,
    order: null,
  });

  if (error) {
    return { success: false, error: "Gagal menyimpan aktivitas" };
  }

  const orderError = await normalizeOrder(admin.supabase);
  if (orderError) {
    return { success: false, error: orderError };
  }

  revalidateActivityViews();
  return { success: true, data: null };
}

export interface ActivityUpdateInput {
  name: string;
  description: string;
  icon: string;
  color: string;
}

export async function updateActivity(
  activityId: string,
  input: ActivityUpdateInput
): Promise<ActionResult<null>> {
  const admin = await requireAdmin();
  if ("error" in admin) {
    return { success: false, error: admin.error };
  }

  const validated = activitySchema.safeParse(input);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Validasi gagal",
    };
  }

  // `order` is left alone — editing text must not move the entry.
  const { error } = await admin.supabase
    .from("activities")
    .update({
      name: validated.data.name,
      description: validated.data.description || null,
      icon: validated.data.icon || null,
      color: validated.data.color || null,
    })
    .eq("id", activityId);

  if (error) {
    return { success: false, error: "Gagal memperbarui aktivitas" };
  }

  revalidateActivityViews();
  return { success: true, data: null };
}

export async function deleteActivity(
  activityId: string
): Promise<ActionResult<null>> {
  const admin = await requireAdmin();
  if ("error" in admin) {
    return { success: false, error: admin.error };
  }

  const { error } = await admin.supabase
    .from("activities")
    .delete()
    .eq("id", activityId);

  if (error) {
    return { success: false, error: "Gagal menghapus aktivitas" };
  }

  // Close the gap so the numbers stay 0, 1, 2, … after a delete.
  const orderError = await normalizeOrder(admin.supabase);
  if (orderError) {
    return { success: false, error: orderError };
  }

  revalidateActivityViews();
  return { success: true, data: null };
}

export async function moveActivity(
  activityId: string,
  direction: "up" | "down"
): Promise<ActionResult<null>> {
  const admin = await requireAdmin();
  if ("error" in admin) {
    return { success: false, error: admin.error };
  }

  const { data, error } = await admin.supabase
    .from("activities")
    .select("id, order");

  if (error) {
    return { success: false, error: "Gagal membaca urutan aktivitas" };
  }

  const moved = moveOrderedRow((data || []) as OrderRow[], activityId, direction);

  if (!moved) {
    return { success: false, error: "Aktivitas tidak ditemukan" };
  }

  const orderError = await persistOrder(admin.supabase, moved.updates);
  if (orderError) {
    return { success: false, error: orderError };
  }

  revalidateActivityViews();
  return { success: true, data: null };
}
