import type { ReactNode } from "react";

/**
 * Ikon inline (satu file, satu komponen) — pengganti emoji/glif teks.
 *
 * Alasan: emoji tampil beda-beda antar OS, ukurannya tidak konsisten dengan
 * tipografi, dan tidak bisa diwarnai. Ikon di sini memakai `currentColor`
 * dengan jalur siku sederhana supaya nyambung dengan gaya neo-brutalist
 * (garis tebal, tanpa lengkung berlebihan).
 *
 * Semua ikon berbagi kanvas 24×24 yang sama, jadi cukup diatur lewat kelas
 * ukuran (`className="size-4"`) di pemanggil.
 */

const ICONS = {
  users: (
    <>
      <circle cx="9" cy="8" r="3.4" />
      <path d="M2.6 20c0-3.3 2.9-5.9 6.4-5.9s6.4 2.6 6.4 5.9" />
      <path d="M16.2 5.2a3.4 3.4 0 0 1 0 6.6" />
      <path d="M18 14.6c2.2.6 3.6 2.6 3.6 5.4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20.4c0-3.6 3.2-6.4 7.2-6.4s7.2 2.8 7.2 6.4" />
    </>
  ),
  chat: (
    <>
      <path d="M21 12.4c0 4-4 7.2-9 7.2-1 0-2-.1-2.9-.4L4.5 21l1.3-3.6A6.9 6.9 0 0 1 3 12.4C3 8.4 7 5.2 12 5.2s9 3.2 9 7.2Z" />
      <path d="M9 12h.01M12 12h.01M15 12h.01" />
    </>
  ),
  send: (
    <>
      <path d="M21.4 2.6 2.6 9.8l7.1 2.6 2.6 7.1 9.1-16.9Z" />
      <path d="m9.7 12.4 4.4-4.4" />
    </>
  ),
  camera: (
    <>
      <path d="M3 7.6h3.2L8.4 5h7.2l2.2 2.6H21v11H3v-11Z" />
      <circle cx="12" cy="13" r="3.4" />
    </>
  ),
  gamepad: (
    <>
      <path d="M7.6 7.5h8.8a5 5 0 0 1 4.9 4.1l.5 4a3 3 0 0 1-5.3 2.3l-.7-.9H7.2l-.7.9a3 3 0 0 1-5.3-2.3l.5-4a5 5 0 0 1 4.9-4.1Z" />
      <path d="M7.4 11v3M5.9 12.5h3M15.6 11.6h.01M17.9 13.4h.01" />
    </>
  ),
  phone: (
    <>
      <path d="M6.6 3.5h3l1.4 3.6-2 1.4a11.6 11.6 0 0 0 5.5 5.5l1.4-2 3.6 1.4v3a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" />
    </>
  ),
  mail: (
    <>
      <path d="M3 5.5h18v13H3v-13Z" />
      <path d="m3.6 6.4 8.4 6.3 8.4-6.3" />
    </>
  ),
  package: (
    <>
      <path d="M12 2.8 20.5 7v10L12 21.2 3.5 17V7L12 2.8Z" />
      <path d="M3.8 7.1 12 11.3l8.2-4.2M12 11.3v9.6" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 8.5 4.4L12 11.8 3.5 7.4 12 3Z" />
      <path d="m3.5 12.2 8.5 4.4 8.5-4.4M3.5 16.6l8.5 4.4 8.5-4.4" />
    </>
  ),
  download: (
    <>
      <path d="M12 3.5v11" />
      <path d="m7.4 10.4 4.6 4.6 4.6-4.6" />
      <path d="M4 19.5h16" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 19.5 5.7v5.6c0 4.4-3.1 8.2-7.5 9.7-4.4-1.5-7.5-5.3-7.5-9.7V5.7L12 3Z" />
      <path d="m8.9 11.8 2.3 2.3 4-4.4" />
    </>
  ),
  code: (
    <>
      <path d="m8.6 8-4 4 4 4M15.4 8l4 4-4 4M13.4 5.4l-2.8 13.2" />
    </>
  ),
  cpu: (
    <>
      <rect x="7" y="7" width="10" height="10" />
      <path d="M10.5 10.5h3v3h-3z" />
      <path d="M4 10h3M4 14h3M17 10h3M17 14h3M10 4v3M14 4v3M10 17v3M14 17v3" />
    </>
  ),
  briefcase: (
    <>
      <path d="M3.5 8h17v11.5h-17V8Z" />
      <path d="M9 8V5.5h6V8M3.5 12.5h17" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3.2a8.8 8.8 0 0 0 0 17.6c1.3 0 2-.9 2-1.9 0-.8-.5-1.4-1.1-1.9-.6-.5-1-.9-1-1.6 0-.9.8-1.6 1.9-1.6h1.6a4.4 4.4 0 0 0 4.4-4.4c0-3.4-3.5-6.2-7.8-6.2Z" />
      <path d="M7.6 9.4h.01M10.4 7h.01M14.4 7h.01M17 9.6h.01" />
    </>
  ),
  layout: (
    <>
      <rect x="3.5" y="4" width="17" height="16" />
      <path d="M3.5 9.5h17M10 9.5V20" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M3.6 12h16.8" />
      <path d="M12 3.4c2.3 2.4 3.5 5.4 3.5 8.6s-1.2 6.2-3.5 8.6c-2.3-2.4-3.5-5.4-3.5-8.6S9.7 5.8 12 3.4Z" />
    </>
  ),
  heart: (
    <>
      <path d="M12 20.2S3.6 15.4 3.6 9.7A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8.4 2.7c0 5.7-8.4 10.5-8.4 10.5Z" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <circle cx="12" cy="12" r="4.4" />
      <path d="M12 3.4V7M12 17v3.6M3.4 12H7M17 12h3.6" />
    </>
  ),
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" />
      <path d="m3.5 16 5-5 4.5 4.5 2.5-2.5 5 5" />
      <path d="M14.6 9h.01" />
    </>
  ),
  video: (
    <>
      <rect x="2.8" y="6" width="12.6" height="12" />
      <path d="m15.4 11 5.8-3.2v8.4L15.4 13" />
    </>
  ),
  handshake: (
    <>
      <path d="M3 9.5 7.6 5h8.8L21 9.5l-4.6 4.6-1.8-1.8-2.6 2.6L9.4 12l-1.8 1.8L3 9.5Z" />
    </>
  ),
  book: (
    <>
      <path d="M4 4.5h6a3 3 0 0 1 3 3v12a2.4 2.4 0 0 0-2.4-2.4H4V4.5ZM20 4.5h-6a3 3 0 0 0-3 3v12a2.4 2.4 0 0 1 2.4-2.4H20V4.5Z" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" />
      <path d="M3.5 10h17M8 3.5v3.4M16 3.5v3.4" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 2.8c3.2 1.8 5 5 5 8.4l-2 3.4h-6l-2-3.4c0-3.4 1.8-6.6 5-8.4Z" />
      <path d="M9 14.6 7.4 20l3.3-2.2h2.6L16.6 20 15 14.6" />
      <circle cx="12" cy="9" r="1.7" />
    </>
  ),
  pen: (
    <>
      <path d="M4 20h4L20 8a2.8 2.8 0 0 0-4-4L4 16v4Z" />
      <path d="m14.5 5.5 4 4" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M19 14.5V19a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 19V7a1.5 1.5 0 0 1 1.5-1.5H10" />
    </>
  ),
  mapPin: (
    <>
      <path d="M12 21.5s7-6.4 7-11.3a7 7 0 1 0-14 0c0 4.9 7 11.3 7 11.3Z" />
      <circle cx="12" cy="10" r="2.7" />
    </>
  ),
  monitor: (
    <>
      <rect x="2.8" y="4.5" width="18.4" height="12" />
      <path d="M9 20h6M12 16.5V20" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="2.8" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.2M8.6 21.2h6.8" />
    </>
  ),
  github: (
    <path
      fill="currentColor"
      stroke="none"
      d="M12 2C6.5 2 2 6.6 2 12.3c0 4.5 2.9 8.4 6.8 9.7.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 2.9.9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5.1 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 4-2.3 4.8-4.6 5.1.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 22 12.3C22 6.6 17.5 2 12 2Z"
    />
  ),
  check: <path d="m4.8 12.6 4.6 4.6L19.2 7.4" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  arrowRight: (
    <>
      <path d="M4 12h15" />
      <path d="m13.5 6.5 6 5.5-6 5.5" />
    </>
  ),
  star: (
    <path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.8l5.9-.8L12 3.6Z" />
  ),
  sparkle: (
    <>
      <path d="M12 3.6l1.9 5 5 1.9-5 1.9-1.9 5-1.9-5-5-1.9 5-1.9 1.9-5Z" />
      <path d="M19 3v3M20.5 4.5h-3" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  /** Ukuran & warna ikut kelas ini (mis. `size-4 text-teal-500`). */
  className?: string;
}

export default function Icon({ name, className = "size-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICONS[name]}
    </svg>
  );
}
