"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/seo";
import { registerSchema, loginSchema } from "@/lib/validations/auth";
import {
  ACCOUNT_BLOCK_MESSAGES,
  accountBlockReason,
} from "@/lib/accountStatus";
import type { ActionResult } from "@/types";

export async function register(
  _prevState: ActionResult<null>,
  formData: FormData
): Promise<ActionResult<null>> {
  const raw = {
    fullname: formData.get("fullname") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validated = registerSchema.safeParse(raw);
  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message || "Validasi gagal";
    return { success: false, error: firstError };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        fullname: validated.data.fullname,
      },
      // Tanpa ini Supabase mengarahkan tautan konfirmasi ke "Site URL" bawaan
      // project — yang di project ini mengarah ke deploy Vercel lama, jadi
      // tautannya jatuh ke halaman login yang salah.
      //
      // Origin diambil dari request asli (host yang benar-benar dipakai saat
      // mendaftar: localhost saat dev, domain produksi saat live), bukan dari
      // env yang bisa basi/di-set untuk domain lain. Fallback-nya `getSiteUrl()`.
      //
      // Catatan di dashboard Supabase (Authentication → URL Configuration):
      // origin ini harus ada di **Redirect URLs**, kalau tidak Supabase
      // menolaknya dan kembali ke Site URL.
      emailRedirectTo: new URL(
        "/auth/callback",
        await getRequestOrigin()
      ).toString(),
    },
  });

  if (error) {
    const message =
      error.message.includes("already registered")
        ? "Email sudah terdaftar"
        : error.message.includes("valid email")
          ? "Format email tidak valid"
          : isRateLimited(error)
            ? "Terlalu banyak percobaan pendaftaran. Coba lagi nanti."
            : "Gagal mendaftar. Silakan coba lagi.";

    return { success: false, error: message };
  }

  // Kalau "Confirm email" dimatikan di Supabase, `signUp` mengembalikan sesi
  // langsung. Sesi itu dibuang di sini: akun baru selalu `pending` (lihat
  // handle_new_user + accountBlockReason), jadi membawanya ke dashboard hanya
  // akan langsung dipantulkan lagi ke halaman login.
  if (data.session) {
    await supabase.auth.signOut();
  }

  // Supabase mengirim email verifikasi saat mendaftar (bawaan "Confirm email").
  // Terverifikasi TIDAK sama dengan boleh masuk: akunnya masih `pending` dan
  // menunggu persetujuan admin (lihat login() di bawah).
  redirect("/login?registered=true");
}

export async function login(
  _prevState: ActionResult<null>,
  formData: FormData
): Promise<ActionResult<null>> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validated = loginSchema.safeParse(raw);
  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message || "Validasi gagal";
    return { success: false, error: firstError };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error || !data?.user) {
    const message = error
      ? error.message.includes("Invalid login credentials")
        ? "Email atau password salah"
        : error.message.includes("Email not confirmed")
          ? "Email belum dikonfirmasi. Buka tautan verifikasi di inbox kamu, atau minta admin mengkonfirmasi akunnya di Supabase."
          : isRateLimited(error)
            ? "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi."
            : "Gagal login. Silakan coba lagi."
      : "Gagal login. Silakan coba lagi.";

    return { success: false, error: message };
  }

  // Supabase Auth tidak tahu apa-apa soal `approval_status`/`is_active`, jadi
  // password yang benar tetap bisa menghasilkan sesi untuk akun yang belum
  // disetujui admin atau yang dinonaktifkan. Keputusannya ada di satu tempat
  // (`accountBlockReason`) supaya tidak berbeda dengan middleware/layout.
  const { data: profile } = await supabase
    .from("users")
    .select("role, is_active, approval_status")
    .eq("id", data.user.id)
    .single();

  const blocked = accountBlockReason(profile);
  if (blocked) {
    await supabase.auth.signOut();
    return { success: false, error: ACCOUNT_BLOCK_MESSAGES[blocked] };
  }

  // Halaman awal setelah masuk: admin ke panel admin, sisanya ke dashboard.
  // Sebelumnya keduanya mendarat di landing page publik, sehingga panel admin
  // hanya bisa dibuka kalau URL-nya dihafal.
  redirect(profile?.role === "admin" ? "/admin" : "/dashboard");
}

/**
 * Supabase answers 429 (or `over_request_rate_limit`) when too many auth
 * requests come from one place. Reporting it as a generic failure sends people
 * hunting for a wrong password that was never wrong.
 */
function isRateLimited(error: { status?: number; code?: string }): boolean {
  return error.status === 429 || error.code === "over_request_rate_limit";
}

/**
 * Origin asli untuk `emailRedirectTo`.
 *
 * `getSiteUrl()` membaca env yang bisa basi (atau di-set ke domain lain dari
 * tempat pengguna mendaftar), sehingga tautan konfirmasi bisa terlempar ke
 * server yang salah — mis. link email mengarah ke deploy Vercel padahal
 * pendaftarannya di `localhost`. Header request lebih bisa dipercaya: `host` +
 * protokol yang dipakai browser pengguna saat ini. Tanpa request context
 * (build/prerender) → fallback ke `getSiteUrl()`.
 */
async function getRequestOrigin(): Promise<URL> {
  try {
    const headerStore = await headers();
    const host =
      headerStore.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      headerStore.get("host");
    const protocol =
      headerStore.get("x-forwarded-proto")?.split(",")[0]?.trim();

    if (host) {
      return new URL(`${protocol || "http"}://${host}`);
    }
  } catch {
    // Tidak ada request context — lanjut ke fallback di bawah.
  }

  return getSiteUrl();
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
