import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { accountBlockReason, loginBlockedPath } from "@/lib/accountStatus";

/**
 * Titik mendarat tautan verifikasi email pendaftaran (`emailRedirectTo` di
 * `src/lib/actions/auth.ts`).
 *
 * Sebelum ini pendaftaran TIDAK mengirim `emailRedirectTo`, jadi Supabase
 * memakai "Site URL" bawaan project — halaman yang tidak menangani token sama
 * sekali, sehingga tautan terasa "menuju ke tempat yang salah".
 *
 * Dua bentuk tautan ditangani:
 * - `?code=...`            → alur PKCE bawaan `@supabase/ssr`
 *   (template email default: `{{ .ConfirmationURL }}`).
 * - `?token_hash=&type=`   → kalau template email dikustom memakai
 *   `{{ .TokenHash }}`; berguna juga saat tautan dibuka di browser/perangkat
 *   lain, karena tidak butuh code verifier dari cookie.
 *
 * PENTING: berhasil memverifikasi email BUKAN berarti boleh masuk. Akun baru
 * dibuat `pending` dan menunggu persetujuan admin, jadi di sini sesinya
 * dibuang lagi dan pengguna dikirim ke halaman login dengan alasannya. Tanpa
 * langkah ini, sekadar mengklik tautan dari email sudah cukup untuk masuk —
 * persetujuan admin jadi tidak ada artinya.
 */

/** `next` hanya boleh path relatif — mencegah open redirect lewat email. */
function safeNext(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = safeNext(searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const supabase = await createClient();

  let verified = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    verified = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    });
    verified = !error;
  }

  // Tautan kedaluwarsa / sudah dipakai / Redirect URL belum di-allow-list di
  // dashboard Supabase. Katakan alasannya di halaman login alih-alih diam-diam
  // membiarkan pengguna di halaman kosong.
  if (!verified) {
    const failure = new URL("/login", origin);
    failure.searchParams.set("confirmFailed", "1");
    return NextResponse.redirect(failure);
  }

  // Tautan yang memang membawa tujuan sendiri (mis. reset password) dihormati
  // apa adanya — verifikasinya sudah berhasil.
  if (next && next !== "/") {
    return NextResponse.redirect(new URL(next, origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("users")
        .select("is_active, approval_status")
        .eq("id", user.id)
        .single()
    : { data: null };

  const blocked = accountBlockReason(profile);

  if (blocked) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL(loginBlockedPath(blocked, "verified"), origin));
  }

  const success = new URL("/login", origin);
  success.searchParams.set("verified", "1");
  return NextResponse.redirect(success);
}
