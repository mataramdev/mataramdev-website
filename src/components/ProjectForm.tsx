"use client";

import { useActionState, useState } from "react";
import { createProject } from "@/lib/actions/projects";
import type { ActionResult } from "@/types";

interface Stack {
  id: string;
  name: string;
}

// The action is passed to `useActionState` directly (not wrapped in an inline
// function) on purpose: React can only serialise a real action reference,
// which is what gives the form its no-JS fallback. Wrapping it turns the form
// into "javascript:throw new Error(...)" — submitting with scripting
// unavailable then does nothing at all. Same shape as /login and PostForm.
//
// The stack list arrives as a prop from the server page, and each stack is a
// *native checkbox* named `stackIds`: checkboxes submit their values without
// client JS, unlike the old buttons + hidden inputs which needed `onClick`.
// Because "is at least one selected?" cannot be known without JS, the submit
// button is only disabled while pending — the "minimal 1 stack" rule is
// enforced by the server (projectSchema), whose error shows in the box below.
export default function ProjectForm({ stacks }: { stacks: Stack[] }) {
  const [state, formAction, isPending] = useActionState(
    createProject,
    { success: false, error: "" } as ActionResult<null>
  );

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* Error message */}
      {!state.success && state.error && (
        <div className="rounded-btn border-[3px] border-[var(--hard-border)] bg-accent-700 p-4 text-sm text-white">
          {state.error}
        </div>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
        >
          Nama Proyek <span className="text-accent-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          minLength={3}
          maxLength={100}
          className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          placeholder="Contoh: Mataram Community Website"
        />
      </div>

      {/* Content / Description */}
      <div>
        <label
          htmlFor="content"
          className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
        >
          Deskripsi Proyek
        </label>
        <textarea
          id="content"
          name="content"
          rows={5}
          maxLength={5000}
          className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          placeholder="Ceritakan tentang proyek Anda..."
        />
        <p className="mt-1 text-xs text-muted">
          Minimal 3 karakter. Gunakan Markdown untuk formatting.
        </p>
      </div>

      {/* GitHub URL */}
      <div>
        <label
          htmlFor="githubUrl"
          className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
        >
          URL GitHub
        </label>
        <input
          type="url"
          id="githubUrl"
          name="githubUrl"
          className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          placeholder="https://github.com/username/repo"
        />
      </div>

      {/* Demo URL */}
      <div>
        <label
          htmlFor="demoUrl"
          className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
        >
          URL Demo
        </label>
        <input
          type="url"
          id="demoUrl"
          name="demoUrl"
          className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          placeholder="https://demo.example.com"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label
          htmlFor="image"
          className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
        >
          Gambar Proyek
        </label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleImageChange}
          className="mt-1 block w-full text-sm text-muted file:mr-4 file:rounded-btn file:border-[3px] file:border-[var(--hard-border)] file:bg-brand-yellow file:px-4 file:py-2 file:text-sm file:font-bold file:text-black hover:file:bg-accent-500 hover:file:text-white"
        />
        <p className="mt-1 text-xs text-muted">
          Format: JPEG, PNG, WebP, atau GIF. Maksimal 5MB.
        </p>
        {imagePreview && (
          <div className="mt-3">
            {/* A just-picked file is a `data:` URL, which next/image cannot
                optimise — it only accepts local paths or allowlisted hosts. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Preview"
              className="h-40 w-auto rounded-btn object-cover"
            />
          </div>
        )}
      </div>

      {/* Stack Selection — native checkboxes so they work without client JS */}
      <fieldset>
        <legend className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground">
          Stack Teknologi <span className="text-accent-500">*</span>
        </legend>
        <p className="mt-1 text-xs text-muted">
          Pilih minimal 1 stack yang digunakan dalam proyek.
        </p>
        {stacks.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Belum ada stack terdaftar — admin perlu menambahkannya di{" "}
            <span className="font-mono">/admin/stack</span> dulu.
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {stacks.map((stack) => (
              <label key={stack.id} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="stackIds"
                  value={stack.id}
                  className="peer sr-only"
                />
                <span className="inline-block rounded-full border-[3px] border-[var(--hard-border)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-3 dark:border-[var(--hard-border)] dark:text-foreground dark:hover:bg-surface-3 peer-checked:border-[var(--hard-border)] peer-checked:bg-accent-500 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-accent-500 peer-focus-visible:ring-offset-2 dark:peer-checked:border-[var(--hard-border)] dark:peer-checked:bg-brand-yellow">
                  {stack.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-btn bg-accent-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-600 disabled:opacity-50"
        >
          {isPending ? "Mengirim..." : "Kirim Proyek"}
        </button>
        <p className="text-xs text-muted">
          Proyek akan diverifikasi oleh admin sebelum tampil.
        </p>
      </div>
    </form>
  );
}
