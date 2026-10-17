"use client";

import { useActionState, useEffect, useRef } from "react";
import { createActivity } from "@/lib/actions/activities";
import type { ActionResult } from "@/types";

const initialState: ActionResult<null> = {
  success: false,
  error: "",
};

export default function ActivityForm() {
  const formRef = useRef<HTMLFormElement>(null);

  // The action is passed to `useActionState` directly (no inline wrapper) so
  // React can serialise it into `$ACTION_*` fields — that is what keeps the
  // form working without client JS (Task 9.1 lesson). Cleared on success only.
  const [state, formAction, pending] = useActionState(
    createActivity,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-6 dark:border-[var(--hard-border)] dark:bg-surface-2">
      {state.success === false && state.error && (
        <div className="mb-4 rounded-btn border-[3px] border-[var(--hard-border)] bg-accent-700 p-3 text-sm text-white">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="mb-4 rounded-btn border-[3px] border-[var(--hard-border)] bg-brand-green p-3 text-sm text-white">
          Aktivitas berhasil ditambahkan di urutan paling bawah.
        </div>
      )}

      <form ref={formRef} action={formAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_120px_140px]">
          <div>
            <label
              htmlFor="name"
              className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
            >
              Nama Aktivitas <span className="text-accent-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={80}
              placeholder="Contoh: Sharing Session"
              className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>

          <div>
            <label
              htmlFor="icon"
              className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
            >
              Ikon
            </label>
            <input
              id="icon"
              name="icon"
              type="text"
              maxLength={8}
              placeholder="🗣️"
              className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3 py-2 text-center text-sm text-foreground placeholder:text-muted focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-[var(--hard-border)] dark:bg-surface-3 dark:text-foreground dark:placeholder:text-muted"
            />
          </div>

          <div>
            <label
              htmlFor="color"
              className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
            >
              Warna
            </label>
            <input
              id="color"
              name="color"
              type="text"
              maxLength={7}
              placeholder="#3b82f6"
              pattern="^#[0-9a-fA-F]{6}$"
              className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
          >
            Deskripsi
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={300}
            placeholder="Penjelasan singkat kegiatan ini."
            className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>

        <div className="flex justify-end border-t border-[var(--hard-border)] pt-4 dark:border-[var(--hard-border)]">
          <button
            type="submit"
            disabled={pending}
            className="rounded-btn bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Menyimpan..." : "+ Tambah Aktivitas"}
          </button>
        </div>
      </form>
    </div>
  );
}
