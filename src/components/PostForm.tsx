"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { createPost, updatePost } from "@/lib/actions/posts";
import {
  POST_CATEGORIES,
  POST_CATEGORY_LABELS,
  type PostCategory,
} from "@/lib/postStatus";
import type { ActionResult } from "@/types";

/** Filled in by the edit page; absent on /artikel/baru. */
export interface PostFormValues {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  tags: string[] | null;
  imageUrl: string | null;
}

const CATEGORY_HINTS: Record<PostCategory, string> = {
  tutorial: "Panduan langkah demi langkah",
  tips: "Tips singkat dan praktik harian",
  event: "Catatan atau pengumuman kegiatan",
  story: "Cerita dan pengalaman pribadi",
};

export default function PostForm({ values }: { values?: PostFormValues }) {
  const isEdit = Boolean(values);

  // The server actions are passed to `useActionState` directly (not wrapped in
  // an inline function) on purpose: React can only serialise a real action
  // reference, which is what gives the form its no-JS fallback. Wrapping it
  // turns the form into "javascript:throw new Error(...)" — submitting with
  // scripting unavailable then does nothing at all. Same shape as /login.
  const [state, formAction, isPending] = useActionState(
    values ? updatePost : createPost,
    { success: false, error: "" } as ActionResult<null>
  );

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // The stored cover, shown until the user picks a replacement.
  const existingImage = values?.imageUrl ?? null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  return (
    <form action={formAction} className="space-y-6">
      {values && <input type="hidden" name="postId" value={values.id} />}

      {!state.success && state.error && (
        <div className="rounded-btn border-[3px] border-[var(--hard-border)] bg-accent-700 p-4 text-sm text-white">
          {state.error}
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
        >
          Judul <span className="text-accent-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={200}
          defaultValue={values?.title}
          className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          placeholder="Contoh: Mulai Kontribusi ke Open Source"
        />
      </div>

      {/* Category */}
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
          defaultValue={values?.category || "tutorial"}
          className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent-500"
        >
          {POST_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {POST_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted">
          {CATEGORY_HINTS.tutorial} · {CATEGORY_HINTS.tips} ·{" "}
          {CATEGORY_HINTS.event} · {CATEGORY_HINTS.story}
        </p>
      </div>

      {/* Tags */}
      <div>
        <label
          htmlFor="tags"
          className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
        >
          Tag
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          maxLength={200}
          defaultValue={values?.tags?.join(", ")}
          className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          placeholder="nextjs, open-source, karier"
        />
        <p className="mt-1 text-xs text-muted">
          Pisahkan dengan koma. Maksimal 5 tag — dipakai untuk filter di halaman
          Artikel.
        </p>
      </div>

      {/* Excerpt */}
      <div>
        <label
          htmlFor="excerpt"
          className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
        >
          Ringkasan
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          maxLength={300}
          defaultValue={values?.excerpt ?? undefined}
          className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          placeholder="Satu atau dua kalimat yang muncul di daftar artikel."
        />
        <p className="mt-1 text-xs text-muted">
          Maksimal 300 karakter.
        </p>
      </div>

      {/* Cover */}
      <div>
        <label
          htmlFor="image"
          className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
        >
          Gambar Cover
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
          {existingImage &&
            " Biarkan kosong kalau tidak ingin mengganti gambar yang sekarang."}
        </p>
        {(imagePreview || existingImage) && (
          <div className="mt-3">
            {imagePreview ? (
              // A just-picked file is a `data:` URL, which next/image cannot
              // optimise — it only accepts local paths or allowlisted hosts.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview}
                alt="Preview"
                className="h-40 w-auto rounded-btn object-cover"
              />
            ) : (
              <Image
                src={existingImage || ""}
                alt="Gambar saat ini"
                width={640}
                height={360}
                className="h-40 w-auto rounded-btn object-cover"
              />
            )}
            <p className="mt-1 text-xs text-muted">
              {imagePreview ? "Gambar baru" : "Gambar saat ini"}
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <label
          htmlFor="content"
          className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
        >
          Isi Artikel <span className="text-accent-500">*</span>
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={18}
          minLength={50}
          defaultValue={values?.content}
          className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 font-mono text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          placeholder={"## Subjudul\n\nTulis artikelmu di sini...\n\n```js\nconsole.log(\"halo\");\n```"}
        />
        <p className="mt-1 text-xs text-muted">
          Mendukung Markdown: heading (`##`), **bold**, *italic*, `code`,
          blok kode, list, link, tabel, dan kutipan. Minimal 50 karakter.
        </p>
      </div>

      {/* Submit */}
      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--hard-border)] pt-6 dark:border-[var(--hard-border)]">
        <button
          type="submit"
          name="status"
          value="published"
          disabled={isPending}
          className="rounded-btn bg-accent-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-600 disabled:opacity-50"
        >
          {isPending
            ? "Menyimpan..."
            : isEdit
              ? "Simpan & Terbitkan"
              : "Publish"}
        </button>
        <button
          type="submit"
          name="status"
          value="draft"
          disabled={isPending}
          className="rounded-btn border-[3px] border-[var(--hard-border)] px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-3 disabled:opacity-50 dark:border-[var(--hard-border)] dark:text-foreground dark:hover:bg-surface-3"
        >
          Simpan sebagai Draf
        </button>
        <p className="text-xs text-muted">
          {isEdit
            ? "Pilih \"Simpan sebagai Draf\" untuk menyembunyikan artikel ini lagi dari halaman publik."
            : "Artikel yang di-publish langsung tampil di halaman Artikel."}
        </p>
      </div>
    </form>
  );
}
