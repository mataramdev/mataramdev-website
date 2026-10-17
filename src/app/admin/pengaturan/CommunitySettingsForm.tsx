"use client";

import { useActionState } from "react";
import { updateCommunitySettings } from "@/lib/actions/community";
import { LOGO_MAX_FILE_MB } from "@/lib/storage";
import type { ActionResult } from "@/types";

interface CommunitySettingsFormProps {
  initialData: {
    name: string;
    description: string;
    keywords: string;
    address: string;
    mapsLocation: string;
    lightLogoUrl: string;
    darkLogoUrl: string;
  };
}

const initialState: ActionResult<null> = {
  success: false,
  error: "",
};

export default function CommunitySettingsForm({
  initialData,
}: CommunitySettingsFormProps) {
  const [state, formAction, pending] = useActionState(
    updateCommunitySettings,
    initialState
  );

  return (
    <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-6 dark:border-[var(--hard-border)] dark:bg-surface-2">
      {state.success === false && state.error && (
        <div className="mb-4 rounded-btn border-[3px] border-[var(--hard-border)] bg-accent-700 p-3 text-sm text-white">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="mb-4 rounded-btn border-[3px] border-[var(--hard-border)] bg-brand-green p-3 text-sm text-white">
          Pengaturan berhasil disimpan!
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
          >
            Nama Komunitas
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initialData.name}
            className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
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
            defaultValue={initialData.description}
            placeholder="Tentang komunitas ini..."
            className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>

        <div>
          <label
            htmlFor="keywords"
            className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
          >
            Keywords (SEO)
          </label>
          <input
            id="keywords"
            name="keywords"
            type="text"
            defaultValue={initialData.keywords}
            placeholder="developer, mataram, ntb, komunitas"
            className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
          <p className="mt-1 text-xs text-muted">
            Pisahkan dengan koma.
          </p>
        </div>

        <div>
          <label
            htmlFor="address"
            className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
          >
            Alamat
          </label>
          <input
            id="address"
            name="address"
            type="text"
            defaultValue={initialData.address}
            placeholder="Kota Mataram, NTB"
            className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>

        <div>
          <label
            htmlFor="mapsLocation"
            className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
          >
            Lokasi Google Maps (URL embed)
          </label>
          <input
            id="mapsLocation"
            name="mapsLocation"
            type="url"
            defaultValue={initialData.mapsLocation}
            placeholder="https://www.google.com/maps/embed?..."
            className="mt-1 block w-full rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>

        <div className="border-t border-[var(--hard-border)] pt-4 dark:border-[var(--hard-border)]">
          <h2 className="font-black uppercase text-sm">
            Logo Komunitas
          </h2>
          <p className="mt-1 text-xs text-muted">
            Logo ini tampil di Navbar dan Footer. Unggah versi terang dan gelap
            supaya terbaca di kedua tema; kalau dikosongkan, teks nama
            komunitas yang dipakai. Maksimal {LOGO_MAX_FILE_MB}MB per gambar.
          </p>

          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            {(
              [
                {
                  key: "lightLogo",
                  removeKey: "removeLightLogo",
                  label: "Logo tema terang",
                  currentUrl: initialData.lightLogoUrl,
                },
                {
                  key: "darkLogo",
                  removeKey: "removeDarkLogo",
                  label: "Logo tema gelap",
                  currentUrl: initialData.darkLogoUrl,
                },
              ] as const
            ).map((logo) => (
              <div key={logo.key}>
                <label
                  htmlFor={logo.key}
                  className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground"
                >
                  {logo.label}
                </label>

                {logo.currentUrl && (
                  <div className="mt-2 flex items-center gap-3 rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-3 p-2 dark:border-[var(--hard-border)] dark:bg-surface-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logo.currentUrl}
                      alt={`Pratinjau ${logo.label}`}
                      className="h-10 max-w-[160px] object-contain"
                    />
                    <label className="flex items-center gap-1.5 text-xs text-muted">
                      <input
                        type="checkbox"
                        name={logo.removeKey}
                        className="h-3.5 w-3.5 rounded border-[var(--hard-border)]"
                      />
                      Hapus logo ini
                    </label>
                  </div>
                )}

                <input
                  id={logo.key}
                  name={logo.key}
                  type="file"
                  accept="image/*"
                  className="mt-2 block w-full text-sm text-muted file:mr-4 file:rounded-btn file:border-0 file:bg-brand-yellow file:px-4 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-accent-500  hover:file:text-white"
                />
                {logo.currentUrl && (
                  <p className="mt-1 text-xs text-muted">
                    Biarkan kosong untuk mempertahankan logo saat ini.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end border-t border-[var(--hard-border)] pt-4 dark:border-[var(--hard-border)]">
          <button
            type="submit"
            disabled={pending}
            className="rounded-btn bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-background"
          >
            {pending ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>
    </div>
  );
}
