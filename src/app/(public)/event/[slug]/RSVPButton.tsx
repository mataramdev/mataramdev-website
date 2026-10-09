"use client";

import Link from "next/link";
import { useActionState } from "react";
import { toggleRsvp } from "@/lib/actions/rsvp";

interface RSVPButtonProps {
  eventId: string;
  /** Tamu anonim diarahkan ke login, bukan diberi tombol yang diam saja. */
  isLoggedIn: boolean;
  /** Halaman login + `redirectedFrom` supaya balik ke event ini. */
  loginHref: string;
  initialJoined: boolean;
  initialCount: number;
}

interface RsvpState {
  joined: boolean;
  count: number;
  error?: string;
}

export default function RSVPButton({
  eventId,
  isLoggedIn,
  loginHref,
  initialJoined,
  initialCount,
}: RSVPButtonProps) {
  const [state, formAction, isPending] = useActionState(
    async (prev: RsvpState): Promise<RsvpState> => {
      const result = await toggleRsvp(eventId);
      if (result.success) {
        return { joined: result.data.joined, count: result.data.count };
      }
      // Sebelumnya error ini dibuang diam-diam, jadi tombol terlihat "tidak
      // melakukan apa-apa". Sekarang pesannya tampil di bawah tombol.
      return { ...prev, error: result.error };
    },
    { joined: initialJoined, count: initialCount }
  );

  const isGoing = state.joined;
  const count = state.count;

  const buttonClass = `inline-flex items-center justify-center gap-2 rounded-btn border-[3px] border-[var(--hard-border)] px-6 py-3 font-black text-sm uppercase tracking-wide shadow-[4px_4px_0_0_var(--hard-shadow)] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_var(--hard-shadow)] disabled:cursor-not-allowed disabled:opacity-50 ${
    isGoing ? "bg-surface-2 text-foreground" : "bg-accent-500 text-white"
  }`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-4">
        {isLoggedIn ? (
          <form action={formAction}>
            <button type="submit" disabled={isPending} className={buttonClass}>
              {isPending ? "Memproses..." : isGoing ? "Batalkan" : "Ikut Event"}
            </button>
          </form>
        ) : (
          <Link href={loginHref} className={buttonClass}>
            → Masuk untuk ikut
          </Link>
        )}

        <span className="font-mono text-xs uppercase text-muted">
          {count === 0
            ? "Belum ada yang daftar"
            : `${count} orang sudah daftar`}
        </span>
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-btn border-[3px] border-[var(--hard-border)] bg-accent-700 px-3 py-2 text-sm text-white"
        >
          {state.error}
        </p>
      )}
    </div>
  );
}
