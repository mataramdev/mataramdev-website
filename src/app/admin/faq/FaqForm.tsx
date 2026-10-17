"use client";

import { useActionState, useEffect, useRef } from "react";
import { createFaq } from "@/lib/actions/faq";
import type { ActionResult } from "@/types";

const initialState: ActionResult<null> = {
  success: false,
  error: "",
};

export default function FaqForm() {
  const formRef = useRef<HTMLFormElement>(null);

  // The action is passed to `useActionState` directly (no inline wrapper) so
  // React can serialise it into `$ACTION_*` fields — that is what gives the
  // form its no-JS fallback. The form is cleared in an effect after a
  // *successful* save; when it fails the filled-in values stay on screen.
  const [state, formAction, pending] = useActionState(createFaq, initialState);

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
          FAQ berhasil ditambahkan di urutan paling bawah.
        </div>
      )}

      <form ref={formRef} action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="question"
            className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
          >
            Pertanyaan <span className="text-accent-500">*</span>
          </label>
          <input
            id="question"
            name="question"
            type="text"
            required
            minLength={5}
            maxLength={300}
            placeholder="Contoh: Apakah komunitas ini gratis?"
            className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>

        <div>
          <label
            htmlFor="answer"
            className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
          >
            Jawaban <span className="text-accent-500">*</span>
          </label>
          <textarea
            id="answer"
            name="answer"
            required
            rows={4}
            minLength={5}
            maxLength={5000}
            placeholder="Jawaban singkat dan jelas."
            className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
          <p className="mt-1 text-xs text-muted">
            Teks biasa — tampil apa adanya di halaman FAQ.
          </p>
        </div>

        <div className="flex justify-end border-t border-[var(--hard-border)] pt-4 dark:border-[var(--hard-border)]">
          <button
            type="submit"
            disabled={pending}
            className="rounded-btn bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Menyimpan..." : "+ Tambah FAQ"}
          </button>
        </div>
      </form>
    </div>
  );
}
