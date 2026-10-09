"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createResource } from "@/lib/actions/resources";
import {
  RESOURCE_CATEGORIES,
  RESOURCE_CATEGORY_ICONS,
  RESOURCE_CATEGORY_LABELS,
} from "@/lib/resourceCategory";
import { RESOURCE_MAX_FILE_MB } from "@/lib/storage";
import type { ActionResult } from "@/types";

const initialState: ActionResult<null> = {
  success: false,
  error: "",
};

const MAX_BYTES = RESOURCE_MAX_FILE_MB * 1024 * 1024;

interface SelectedFile {
  name: string;
  size: number;
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function ResourceForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);

  // The action is passed to `useActionState` directly (no inline wrapper) so
  // React can serialise it into `$ACTION_*` fields — that is what gives the
  // form its no-JS fallback. The form is cleared in an effect after a
  // *successful* upload; when it fails the filled-in values stay on screen.
  const [state, formAction, pending] = useActionState(
    createResource,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  const isOversized = (selectedFile?.size ?? 0) > MAX_BYTES;

  return (
    <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-6 dark:border-[var(--hard-border)] dark:bg-surface-2">
      {state.success === false && state.error && (
        <div className="mb-4 rounded-btn border-[3px] border-[var(--hard-border)] bg-accent-700 p-3 text-sm text-white">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="mb-4 rounded-btn border-[3px] border-[var(--hard-border)] bg-brand-green p-3 text-sm text-white">
          Resource berhasil diunggah dan langsung tampil di halaman publik.
        </div>
      )}

      {/* `form.reset()` fires a `reset` event, so the selected-file label is
          cleared here instead of inside an effect (setState inside an effect
          is a lint error, and this keeps the label in sync with the input). */}
      <form
        ref={formRef}
        action={formAction}
        onReset={() => setSelectedFile(null)}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
            >
              Nama Resource <span className="text-accent-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={3}
              maxLength={150}
              placeholder="Contoh: Cheatsheet Git untuk Pemula"
              className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
            >
              Kategori <span className="text-accent-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue="doc"
              className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-[var(--hard-border)] dark:bg-surface-3 dark:text-foreground"
            >
              {RESOURCE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {RESOURCE_CATEGORY_ICONS[category]}{" "}
                  {RESOURCE_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="icon"
              className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
            >
              Ikon (opsional)
            </label>
            <input
              id="icon"
              name="icon"
              type="text"
              maxLength={16}
              placeholder="📘"
              className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
            <p className="mt-1 text-xs text-muted">
              Tempel satu emoji. Kalau dikosongkan, ikon kategori yang dipakai.
            </p>
          </div>

          <div>
            <label
              htmlFor="file"
              className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
            >
              File <span className="text-accent-500">*</span>
            </label>
            <input
              id="file"
              name="file"
              type="file"
              required
              onChange={(event) => {
                const file = event.target.files?.[0];
                setSelectedFile(
                  file ? { name: file.name, size: file.size } : null
                );
              }}
              className="mt-1 block w-full text-sm text-muted file:mr-4 file:rounded-btn file:border-[3px] file:border-[var(--hard-border)] file:bg-brand-yellow file:px-4 file:py-2 file:text-sm file:font-bold file:text-black hover:file:bg-accent-500 hover:file:text-white"
            />
            {selectedFile ? (
              <p
                className={`mt-1 text-xs ${
                  isOversized
                    ? "text-accent-600 dark:text-accent-400"
                    : "text-muted"
                }`}
              >
                Terpilih: {selectedFile.name} (
                {formatFileSize(selectedFile.size)})
                {isOversized &&
                  ` — melebihi batas ${RESOURCE_MAX_FILE_MB}MB, pilih file lain.`}
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted">
                PDF, ZIP, gambar, atau file lain. Maksimal{" "}
                {RESOURCE_MAX_FILE_MB}MB.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-[var(--hard-border)] pt-4 dark:border-[var(--hard-border)]">
          <button
            type="submit"
            disabled={pending || isOversized}
            className="rounded-btn bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Mengunggah..." : "+ Unggah Resource"}
          </button>
        </div>
      </form>
    </div>
  );
}
