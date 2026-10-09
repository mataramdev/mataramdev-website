"use client";

import { useActionState, useRef, useState } from "react";
import { createEvent, updateEvent } from "@/lib/actions/events";
import { PEOPLE_PHOTOS } from "@/lib/thumbnails";
import type { ActionResult } from "@/types";

/** Satu pembicara seperti yang tersimpan di `event_speakers`. */
interface SpeakerFormData {
  name: string;
  topic: string;
  photoUrl: string;
}

/**
 * Baris pembicara di dalam form. `preview` hanya untuk tampilan: foto yang baru
 * dipilih (object URL) atau foto galeri/tersimpan; berkasnya sendiri dikirim
 * lewat input `speakerPhoto`.
 */
interface SpeakerRowState extends SpeakerFormData {
  preview: string;
}

interface EventFormData {
  id?: string;
  title: string;
  excerpt: string;
  description: string;
  status: string;
  startTime: string;
  endTime: string;
  locationName: string;
  locationUrl: string;
  imageUrl: string;
  speakers?: SpeakerFormData[];
}

interface EventFormProps {
  initialData?: EventFormData;
}

const defaultData: EventFormData = {
  title: "",
  excerpt: "",
  description: "",
  status: "upcoming",
  startTime: "",
  endTime: "",
  locationName: "",
  locationUrl: "",
  imageUrl: "",
  speakers: [],
};

const initialState: ActionResult<null> = {
  success: false,
  error: "",
};

const STATUS_OPTIONS = [
  { value: "upcoming", label: "Akan Datang" },
  { value: "ongoing", label: "Berlangsung" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

export default function EventForm({ initialData }: EventFormProps) {
  const data = initialData || defaultData;
  const isEdit = !!data.id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(data.imageUrl);
  const [speakers, setSpeakers] = useState<SpeakerRowState[]>(
    (data.speakers ?? []).map((speaker) => ({
      ...speaker,
      preview: speaker.photoUrl,
    }))
  );

  const action = isEdit
    ? (_prev: ActionResult<null>, formData: FormData) =>
        updateEvent(data.id!, _prev, formData)
    : createEvent;

  const [state, formAction, pending] = useActionState(action, initialState);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const addSpeaker = () => {
    setSpeakers((rows) => [...rows, { name: "", topic: "", photoUrl: "", preview: "" }]);
  };

  const updateSpeaker = (index: number, patch: Partial<SpeakerRowState>) => {
    setSpeakers((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  };

  const removeSpeaker = (index: number) => {
    setSpeakers((rows) => rows.filter((_, i) => i !== index));
  };

  // Foto unggahan menang atas pilihan galeri — sama seperti urutan yang dibaca
  // `readSpeakerRows()` di src/lib/actions/events.ts.

  return (
    <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-6 dark:border-[var(--hard-border)] dark:bg-surface-2">
      {state.success === false && state.error && (
        <div className="mb-4 rounded-btn border-[3px] border-[var(--hard-border)] bg-accent-700 p-3 text-sm text-white">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
          >
            Judul Event *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={data.title}
            placeholder="Judul event"
            className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label
            htmlFor="excerpt"
            className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
          >
            Excerpt
          </label>
          <input
            id="excerpt"
            name="excerpt"
            type="text"
            defaultValue={data.excerpt}
            placeholder="Ringkasan singkat event"
            className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>

        {/* Description */}
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
            rows={5}
            defaultValue={data.description}
            placeholder="Deskripsi lengkap event (supports Markdown)"
            className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={data.status}
            className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-[var(--hard-border)] dark:bg-surface-3 dark:text-foreground"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date & Time */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="startTime"
              className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
            >
              Waktu Mulai *
            </label>
            <input
              id="startTime"
              name="startTime"
              type="datetime-local"
              required
              defaultValue={data.startTime}
              className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-[var(--hard-border)] dark:bg-surface-3 dark:text-foreground"
            />
          </div>
          <div>
            <label
              htmlFor="endTime"
              className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
            >
              Waktu Selesai
            </label>
            <input
              id="endTime"
              name="endTime"
              type="datetime-local"
              defaultValue={data.endTime}
              className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-[var(--hard-border)] dark:bg-surface-3 dark:text-foreground"
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="locationName"
              className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
            >
              Nama Lokasi
            </label>
            <input
              id="locationName"
              name="locationName"
              type="text"
              defaultValue={data.locationName}
              placeholder="Contoh: Cafe Kopi Mataram"
              className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div>
            <label
              htmlFor="locationUrl"
              className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
            >
              URL Lokasi (Google Maps)
            </label>
            <input
              id="locationUrl"
              name="locationUrl"
              type="url"
              defaultValue={data.locationUrl}
              placeholder="https://maps.google.com/..."
              className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground">
            Poster Event
          </label>
          <div className="mt-1 flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 rounded-btn border-[3px] border-[var(--hard-border)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-3 dark:border-[var(--hard-border)] dark:text-foreground dark:hover:bg-surface-3"
            >
              Pilih Gambar
            </button>
            <input
              ref={fileInputRef}
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {preview && (
              <div className="relative h-20 w-20 overflow-hidden rounded-btn border-[3px] border-[var(--hard-border)] dark:border-[var(--hard-border)]">
                {/* A just-picked file is a `data:` URL, which next/image cannot
                    optimise — it only accepts local paths or allowlisted hosts. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Pembicara */}
        <div>
          <div className="flex items-center justify-between gap-3">
            <label className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground">
              Pembicara
            </label>
            <button
              type="button"
              onClick={addSpeaker}
              className="rounded-btn border-[3px] border-[var(--hard-border)] bg-brand-yellow px-3 py-1.5 font-black text-xs uppercase text-black shadow-[3px_3px_0_0_var(--hard-shadow)]"
            >
              + Tambah Pembicara
            </button>
          </div>
          <p className="mt-1 text-xs text-muted">
            Nama bebas (tidak harus anggota), foto boleh dari galeri bawaan atau
            diunggah sendiri. Baris tanpa nama diabaikan saat disimpan.
          </p>

          {speakers.length === 0 ? (
            <p className="mt-3 rounded-btn border-[3px] border-dashed border-[var(--hard-border)] px-3 py-2 text-sm text-muted">
              Belum ada pembicara.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {speakers.map((speaker, index) => (
                <li
                  key={index}
                  className="rounded-btn border-[3px] border-[var(--hard-border)] bg-surface p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0">
                      {speaker.preview ? (
                        // Bisa jadi object URL dari berkas yang baru dipilih —
                        // next/image tidak bisa mengoptimalkannya.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={speaker.preview}
                          alt=""
                          className="h-16 w-16 border-[3px] border-[var(--hard-border)] object-cover"
                        />
                      ) : (
                        <span className="flex h-16 w-16 items-center justify-center border-[3px] border-dashed border-[var(--hard-border)] text-[10px] uppercase text-muted">
                          Foto
                        </span>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          name="speakerName"
                          type="text"
                          value={speaker.name}
                          onChange={(e) =>
                            updateSpeaker(index, { name: e.target.value })
                          }
                          placeholder="Nama pembicara"
                          className="block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
                        />
                        <input
                          name="speakerTopic"
                          type="text"
                          value={speaker.topic}
                          onChange={(e) =>
                            updateSpeaker(index, { topic: e.target.value })
                          }
                          placeholder="Topik (opsional)"
                          className="block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
                        />
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <select
                          name="speakerPhotoUrl"
                          value={
                            PEOPLE_PHOTOS.includes(
                              speaker.photoUrl as (typeof PEOPLE_PHOTOS)[number]
                            )
                              ? speaker.photoUrl
                              : ""
                          }
                          onChange={(e) =>
                            updateSpeaker(index, {
                              photoUrl: e.target.value,
                              preview: e.target.value,
                            })
                          }
                          className="block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent-500"
                        >
                          <option value="">— Foto dari galeri —</option>
                          {PEOPLE_PHOTOS.map((photo) => (
                            <option key={photo} value={photo}>
                              {photo.replace("/images/people/", "")}
                            </option>
                          ))}
                        </select>
                        <input
                          name="speakerPhoto"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              updateSpeaker(index, {
                                preview: URL.createObjectURL(file),
                              });
                            }
                          }}
                          className="block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3 py-1.5 text-xs text-foreground file:mr-2 file:rounded-btn file:border-[3px] file:border-[var(--hard-border)] file:bg-surface-3 file:px-2 file:py-1 file:font-bold file:uppercase"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSpeaker(index)}
                      aria-label={`Hapus pembicara ${index + 1}`}
                      className="shrink-0 rounded-btn border-[3px] border-[var(--hard-border)] px-2 py-1 font-black text-xs uppercase text-foreground hover:bg-accent-700 hover:text-white"
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <a
            href="/admin/event"
            className="rounded-btn border-[3px] border-[var(--hard-border)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-3 dark:border-[var(--hard-border)] dark:text-foreground dark:hover:bg-surface-3"
          >
            Batal
          </a>
          <button
            type="submit"
            disabled={pending}
            className="rounded-btn bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-background"
          >
            {pending
              ? isEdit
                ? "Memperbarui..."
                : "Membuat..."
              : isEdit
                ? "Simpan Perubahan"
                : "Buat Event"}
          </button>
        </div>
      </form>
    </div>
  );
}
