"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/lib/actions/auth";
import type { ActionResult } from "@/types";
import { BTN_RED, FIELD, HARD_CARD, LABEL, NEO_BADGE } from "@/components/ui/brutalist";

const initialState: ActionResult<null> = {
  success: false,
  error: "",
};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <div className={`${HARD_CARD} bg-surface-2 p-8`}>
      <span className={`${NEO_BADGE} bg-accent-500 text-white`}>Daftar</span>
      <h1 className="mt-4 font-black uppercase leading-none text-2xl">
        Daftar ke Mataram Dev
      </h1>
      <p className="mt-2 text-sm text-muted">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-bold text-teal-600 underline underline-offset-2 dark:text-teal-300"
        >
          Masuk
        </Link>
      </p>

      <p className="mt-4 rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-3 p-3 text-xs text-muted">
        Setelah mendaftar, akunmu masuk daftar tunggu dan perlu{" "}
        <strong className="font-bold text-foreground">disetujui admin</strong>{" "}
        dulu. Sambil menunggu, buka tautan verifikasi yang dikirim ke emailmu.
      </p>

      {state.success === false && state.error && (
        <div className="mt-5 rounded-btn border-[3px] border-[var(--hard-border)] bg-accent-700 p-3 text-sm text-white">
          {state.error}
        </div>
      )}

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="fullname" className={LABEL}>
            Nama Lengkap
          </label>
          <input
            id="fullname"
            name="fullname"
            type="text"
            required
            autoComplete="name"
            placeholder="Nama lengkap kamu"
            className={FIELD}
          />
        </div>

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
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={LABEL}>
            Konfirmasi Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Ulangi password"
            className={FIELD}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className={`${BTN_RED} mt-2 w-full`}
        >
          {pending ? "Sedang mendaftar..." : "Daftar"}
        </button>
      </form>
    </div>
  );
}
