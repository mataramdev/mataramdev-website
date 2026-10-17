"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login } from "@/lib/actions/auth";
import { ACCOUNT_BLOCK_MESSAGES, type AccountBlock } from "@/lib/accountStatus";
import type { ActionResult } from "@/types";
import { BTN_RED, FIELD, HARD_CARD, LABEL, NEO_BADGE } from "@/components/ui/brutalist";

const initialState: ActionResult<null> = {
  success: false,
  error: "",
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";
  // Diisi oleh /auth/callback begitu email berhasil diverifikasi.
  const verified = searchParams.get("verified") === "1";
  // Diisi middleware/layout/server action saat akun tidak boleh masuk:
  // `pending` (menunggu persetujuan admin), `rejected`, atau `deactivated`.
  const blockedParam = searchParams.get("blocked");
  const blocked: AccountBlock | null =
    blockedParam === "pending" ||
    blockedParam === "rejected" ||
    blockedParam === "deactivated"
      ? blockedParam
      : null;
  // Diisi oleh /auth/callback kalau tautan konfirmasi email gagal ditukar
  // jadi sesi (kedaluwarsa, sudah dipakai, atau Redirect URL belum
  // di-allow-list di dashboard Supabase).
  const confirmFailed = searchParams.get("confirmFailed") === "1";

  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className={`${HARD_CARD} bg-surface-2 p-8`}>
      <span className={`${NEO_BADGE} bg-accent-500 text-white`}>Masuk</span>
      <h1 className="mt-4 font-black uppercase leading-none text-2xl">
        Masuk ke Mataram Dev
      </h1>
      <p className="mt-2 text-sm text-muted">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-bold text-teal-600 underline underline-offset-2 dark:text-teal-300"
        >
          Daftar sekarang
        </Link>
      </p>

      {justRegistered && (
        <div className="mt-5 rounded-btn border-[3px] border-[var(--hard-border)] bg-brand-green p-3 text-sm text-white">
          Pendaftaran berhasil! Buka tautan verifikasi di emailmu, lalu tunggu
          admin menyetujui akunmu sebelum bisa masuk.
        </div>
      )}

      {verified && !blocked && (
        <div className="mt-5 rounded-btn border-[3px] border-[var(--hard-border)] bg-brand-green p-3 text-sm text-white">
          Email berhasil diverifikasi. Silakan masuk.
        </div>
      )}

      {confirmFailed && (
        <div className="mt-5 rounded-btn border-[3px] border-[var(--hard-border)] bg-accent-700 p-3 text-sm text-white">
          Tautan konfirmasi email tidak valid atau sudah kedaluwarsa. Coba masuk
          dulu — kalau masih ditolak, hubungi admin untuk mengkonfirmasi
          akunmu.
        </div>
      )}

      {blocked && (
        <div className="mt-5 rounded-btn border-[3px] border-[var(--hard-border)] bg-accent-700 p-3 text-sm text-white">
          {verified && "Email berhasil diverifikasi. "}
          {ACCOUNT_BLOCK_MESSAGES[blocked]}
        </div>
      )}

      {state.success === false && state.error && (
        <div className="mt-5 rounded-btn border-[3px] border-[var(--hard-border)] bg-accent-700 p-3 text-sm text-white">
          {state.error}
        </div>
      )}

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="email" className={LABEL}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="kamu@contoh.com"
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="password" className={LABEL}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={FIELD}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className={`${BTN_RED} mt-2 w-full`}
        >
          {pending ? "Sedang masuk..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
