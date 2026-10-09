"use client";

import { useActionState, useState } from "react";
import { addSocialLink, removeSocialLink } from "@/lib/actions/profile";
import type { ActionResult } from "@/types";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

interface SocialLinksSectionProps {
  initialLinks: SocialLink[];
}

const PLATFORMS = [
  { value: "github", label: "GitHub" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter / X" },
  { value: "discord", label: "Discord" },
  { value: "website", label: "Website / Portfolio" },
];

const addInitialState: ActionResult<null> = {
  success: false,
  error: "",
};

export default function SocialLinksSection({
  initialLinks,
}: SocialLinksSectionProps) {
  const [links, setLinks] = useState<SocialLink[]>(initialLinks);
  const [addState, addFormAction, addPending] = useActionState(
    addSocialLink,
    addInitialState
  );

  const handleRemove = async (linkId: string) => {
    const result = await removeSocialLink(linkId);
    if (result.success) {
      setLinks((prev) => prev.filter((l) => l.id !== linkId));
    }
  };

  return (
    <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-6 dark:border-[var(--hard-border)] dark:bg-surface-2">
      <h2 className="font-black uppercase text-lg">
        Tautan Sosial
      </h2>
      <p className="mt-1 text-sm text-muted">
        Tambahkan tautan ke profil sosial atau website kamu.
      </p>

      {/* Existing Links */}
      {links.length > 0 && (
        <div className="mt-4 space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between rounded-btn border-[3px] border-[var(--hard-border)] px-4 py-3 dark:border-[var(--hard-border)]"
            >
              <div className="min-w-0">
                <span className="text-xs font-medium uppercase text-muted">
                  {link.platform}
                </span>
                <p className="truncate text-sm text-foreground">
                  {link.url}
                </p>
              </div>
              <button
                onClick={() => handleRemove(link.id)}
                className="ml-4 shrink-0 text-sm text-accent-600 hover:text-accent-700 dark:text-accent-500 dark:hover:text-accent-300"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Link Form */}
      <form action={addFormAction} className="mt-4 space-y-3">
        {addState.success === false && addState.error && (
          <div className="rounded-btn border-[3px] border-[var(--hard-border)] bg-accent-700 p-3 text-sm text-white">
            {addState.error}
          </div>
        )}

        <div className="flex gap-3">
          <select
            name="platform"
            required
            defaultValue=""
            className="w-40 shrink-0 rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3 py-2 text-sm text-foreground focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-[var(--hard-border)] dark:bg-surface-3 dark:text-foreground"
          >
            <option value="" disabled>
              Platform
            </option>
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <input
            name="url"
            type="url"
            required
            placeholder="https://..."
            className="flex-1 rounded-btn border-[3px] border-[var(--hard-border)] bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-[var(--hard-border)] dark:bg-surface-3 dark:text-foreground dark:placeholder:text-muted"
          />

          <button
            type="submit"
            disabled={addPending}
            className="shrink-0 rounded-btn bg-brand-ink text-white px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-surface-3 dark:text-foreground "
          >
            {addPending ? "..." : "Tambah"}
          </button>
        </div>
      </form>
    </div>
  );
}
