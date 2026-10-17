"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/actions/profile";
import type { ActionResult } from "@/types";

interface ProfileFormProps {
  initialData: {
    fullname: string;
    username: string;
    bio: string;
    email: string;
  };
}

const initialState: ActionResult<null> = {
  success: false,
  error: "",
};

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  return (
    <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-6 dark:border-[var(--hard-border)] dark:bg-surface-2">
      <h2 className="font-black uppercase text-lg">
        Informasi Profil
      </h2>

      {state.success === false && state.error && (
        <div className="mt-4 rounded-btn border-[3px] border-[var(--hard-border)] bg-accent-700 p-3 text-sm text-white">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="mt-4 rounded-btn border-[3px] border-[var(--hard-border)] bg-brand-green p-3 text-sm text-white">
          Profil berhasil diperbarui!
        </div>
      )}

      <form action={formAction} className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="fullname"
            className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
          >
            Nama Lengkap
          </label>
          <input
            id="fullname"
            name="fullname"
            type="text"
            required
            defaultValue={initialData.fullname}
            className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>

        <div>
          <label
            htmlFor="username"
            className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
          >
            Username
          </label>
          <div className="mt-1 flex rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 focus-within:border-accent-500 focus-within:ring-1 focus-within:ring-accent-500 dark:border-[var(--hard-border)] dark:bg-surface-3 dark:focus-within:border-accent-500">
            <span className="flex items-center pl-3 text-sm text-muted">
              @
            </span>
            <input
              id="username"
              name="username"
              type="text"
              required
              defaultValue={initialData.username}
              placeholder="username"
              className="block w-full rounded-r-lg border-0 bg-transparent px-1 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none dark:text-foreground dark:placeholder:text-muted"
            />
          </div>
          <p className="mt-1 text-xs text-muted">
            Huruf kecil, angka, dan underscore saja.
          </p>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            disabled
            defaultValue={initialData.email}
            className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-3 px-3.5 py-2.5 text-sm text-muted"
          />
          <p className="mt-1 text-xs text-muted">
            Email tidak dapat diubah dari sini.
          </p>
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
          >
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            defaultValue={initialData.bio}
            placeholder="Ceritakan sedikit tentang diri kamu..."
            className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="rounded-btn bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-background"
          >
            {pending ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
