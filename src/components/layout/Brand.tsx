/**
 * Brand lockup bersama untuk Navbar & Footer: **mark gambar + wordmark teks
 * dua warna**.
 *
 * Dipisah ke satu file supaya aturannya tidak bercabang di dua tempat:
 *
 * - Mark: berkas gambar dari `public/images/logo/mark-{light,dark}.svg`
 *   (atau unggahan admin). Variannya dipilih lewat `dark:` — tema aplikasi
 *   memakai kelas `.dark` di `<html>` (lihat `@custom-variant dark` di
 *   `globals.css`), jadi `dark:hidden` / `dark:block` benar-benar mengikuti
 *   pilihan pengguna, bukan tema sistem operasi.
 * - Teks: `Mataram` + `Dev`, kata terakhir berwarna brand — bentuk wordmark
 *   yang dipakai sebelum restyle neo-brutalist. Ini permintaan pemilik produk:
 *   teks brand sengaja TIDAK ikut uppercase/brutalist seperti elemen lain.
 *
 * Mark-nya dekoratif (alt kosong) karena link-nya sudah punya nama dari
 * wordmark (`aria-label` pemanggil).
 */

function LogoMark() {
  return (
    <span
      aria-hidden="true"
      className="size-[30px] shrink-0 rounded-md"
      style={{
        background:
          "conic-gradient(from 90deg, #ea4335, #f7d000, #4286f4, #40a95a, #ea4335)",
      }}
    />
  );
}

/**
 * Pecah nama komunitas jadi dua bagian untuk wordmark dua warna: `Mataram` +
 * `Dev` (kata terakhir diberi warna brand). Nama satu kata cukup ditampilkan
 * apa adanya tanpa bagian berwarna.
 */
function splitWordmark(name: string): { lead: string; tail: string } {
  const trimmed = name.trim();
  const lastSpace = trimmed.lastIndexOf(" ");

  if (lastSpace <= 0) return { lead: trimmed, tail: "" };

  return {
    lead: trimmed.slice(0, lastSpace + 1),
    tail: trimmed.slice(lastSpace + 1),
  };
}

interface BrandProps {
  name: string;
  /** Logo untuk tema terang (dipakai juga sebagai cadangan di tema gelap). */
  lightLogo?: string | null;
  /** Logo untuk tema gelap. */
  darkLogo?: string | null;
  /**
   * `theme` (bawaan): mark berganti mengikuti tema aktif (Navbar).
   * `dark-surface`: mark untuk permukaan gelap dipakai terus (Footer navy).
   */
  variant?: "theme" | "dark-surface";
  /** Kelas tinggi mark — Navbar `h-9`, Footer `h-10`. */
  markClass?: string;
  /** Kelas ukuran wordmark. */
  textClass?: string;
}

export default function Brand({
  name,
  lightLogo,
  darkLogo,
  variant = "theme",
  markClass = "h-9",
  textClass = "text-[17px]",
}: BrandProps) {
  const { lead, tail } = splitWordmark(name);

  let mark;
  if (variant === "dark-surface") {
    // Footer selalu navy, jadi varian gelapnya dipakai tanpa peduli tema.
    const src = darkLogo ?? lightLogo;
    mark = src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" aria-hidden="true" className={`${markClass} w-auto`} />
    ) : (
      <LogoMark />
    );
  } else if (lightLogo) {
    mark = (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={lightLogo}
          alt=""
          aria-hidden="true"
          className={`${markClass} w-auto dark:hidden`}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={darkLogo ?? lightLogo}
          alt=""
          aria-hidden="true"
          className={`hidden ${markClass} w-auto dark:block`}
        />
      </>
    );
  } else {
    mark = <LogoMark />;
  }

  return (
    <>
      {mark}

      <span
        className={`font-black leading-none tracking-tight ${textClass}`}
      >
        {lead}
        <span className="text-brand-blue">{tail}</span>
      </span>
    </>
  );
}
