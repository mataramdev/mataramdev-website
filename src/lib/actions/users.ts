"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/utils";

/**
 * Task 9.2 (PRD §4.1): admin manage user.
 *
 * `role` and `is_active` are NOT in the UPDATE grant on `users` (anti
 * self-promotion — policies.sql section 1), so both changes go through the
 * SECURITY DEFINER RPCs, which re-check is_admin() and refuse self-changes.
 * The check below is only for a friendlier error; the RPC is the real gate.
 *
 * Both actions redirect with `?updated=...` / `?error=...` instead of
 * returning state, so the forms work without client JS (Task 9.1 lesson).
 */

async function requireAdminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") {
    redirect("/");
  }

  return supabase;
}

function fail(message: string): never {
  redirect(`/admin/users?error=${encodeURIComponent(message)}`);
}

export async function setUserRole(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!isUuid(userId)) {
    fail("Pengguna tidak ditemukan");
  }
  if (role !== "admin" && role !== "contributor") {
    fail("Role tidak dikenal");
  }

  const supabase = await requireAdminClient();

  const { error } = await supabase.rpc("admin_set_user_role", {
    p_user_id: userId,
    p_role: role,
  });

  if (error) {
    fail(friendlyRpcError(error.message, "mengubah role"));
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?updated=role");
}

const APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;

/**
 * Setujui / tolak pendaftaran (Task: approval pendaftaran).
 *
 * Akun baru dibuat `pending` oleh trigger `handle_new_user` dan tidak bisa
 * login sampai disetujui. Menyetujui sekaligus mengaktifkan akunnya, jadi
 * "approve" benar-benar berarti boleh masuk — lihat `admin_set_user_approval`
 * di policies.sql.
 */
export async function setUserApproval(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!isUuid(userId)) {
    fail("Pengguna tidak ditemukan");
  }
  if (!APPROVAL_STATUSES.includes(status as (typeof APPROVAL_STATUSES)[number])) {
    fail("Status persetujuan tidak dikenal");
  }

  const supabase = await requireAdminClient();

  const { error } = await supabase.rpc("admin_set_user_approval", {
    p_user_id: userId,
    p_status: status,
  });

  if (error) {
    fail(friendlyRpcError(error.message, "mengubah status persetujuan"));
  }

  revalidatePath("/admin/users");
  redirect(`/admin/users?updated=${status}`);
}

export async function setUserActive(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") ?? "");
  const active = String(formData.get("active") ?? "");

  if (!isUuid(userId)) {
    fail("Pengguna tidak ditemukan");
  }
  if (active !== "true" && active !== "false") {
    fail("Status akun tidak dikenal");
  }

  const supabase = await requireAdminClient();

  const { error } = await supabase.rpc("admin_set_user_active", {
    p_user_id: userId,
    p_active: active === "true",
  });

  if (error) {
    fail(friendlyRpcError(error.message, "mengubah status akun"));
  }

  revalidatePath("/admin/users");
  redirect(
    active === "true" ? "/admin/users?updated=activated" : "/admin/users?updated=deactivated"
  );
}

/** PostgREST prefixes raised messages with the function name; strip the noise. */
function friendlyRpcError(raw: string, verb: string): string {
  const cleaned = raw.replace(/^public\.admin_set_user_\w+:\s*/, "").trim();
  if (!cleaned || cleaned.toLowerCase().includes("permission")) {
    return `Gagal ${verb}`;
  }
  return cleaned;
}
