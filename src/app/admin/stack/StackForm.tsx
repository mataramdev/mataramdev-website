"use client";

import { useActionState, useEffect, useRef } from "react";
import { createStack } from "@/lib/actions/stacks";
import type { ActionResult } from "@/types";

const initialState: ActionResult<null> = {
  success: false,
  error: "",
};

export default function StackForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    createStack,
    initialState
  );

  // Clear the input after a successful add so the next entry starts blank.
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
          Stack berhasil ditambahkan.
        </div>
      )}

      <form ref={formRef} action={formAction} className="flex flex-wrap gap-3">
        <div className="min-w-[12rem] flex-1">
          <label
            htmlFor="name"
            className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
          >
            Nama Stack
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={50}
            placeholder="Contoh: Next.js, Laravel, Figma"
            className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending}
            className="rounded-btn bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Menambahkan..." : "+ Tambah Stack"}
          </button>
        </div>
      </form>
    </div>
  );
}
