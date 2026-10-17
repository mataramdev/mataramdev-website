/**
 * Thumbnail cadangan untuk kartu & hero detail (event, proyek, artikel).
 *
 * Berkas diambil dari `public/images/` — hasil salinan `ui_design_canva/asets/images/`
 * (Task aset gambar). Dipakai **hanya** saat baris di DB belum punya
 * `image_url`, supaya kartu tidak pernah tampil kosong.
 *
 * Pemilihan deterministik: indeks dihitung dari hash string seed (slug/judul),
 * sehingga satu konten selalu mendapat gambar yang sama di setiap render,
 * server maupun client (tidak ada flicker antar render).
 */

export type ThumbnailKind = "event" | "project" | "article";

/** Foto kegiatan komunitas — untuk kartu & detail event. */
const EVENT_PHOTOS = [
  "/images/events/fotobareng.webp",
  "/images/events/fotobareng-2.webp",
  "/images/events/audiens1.webp",
  "/images/events/audiens2.webp",
  "/images/events/audiens3.webp",
  "/images/events/audiens4.webp",
  "/images/events/audiens5.webp",
  "/images/events/wfc1.webp",
  "/images/events/wfc2.webp",
  "/images/events/wfc3.webp",
  "/images/events/wfc4.webp",
  "/images/events/wfc5.webp",
  "/images/events/wfc6.webp",
  "/images/events/wfc7.webp",
  "/images/events/wfc8.webp",
  "/images/events/wfc9.webp",
  "/images/events/wfc10.webp",
  "/images/events/wfc11.webp",
  "/images/events/discussion1.webp",
  "/images/events/discussion2.webp",
  "/images/events/discussion3.webp",
  "/images/events/discuusion4.webp",
  "/images/events/networking.webp",
  "/images/events/sharing-session.webp",
  "/images/events/mc.webp",
  "/images/events/japanese1.webp",
] as const;

/** Foto kolaborasi/wrkshopt — untuk kartu & detail proyek. */
const PROJECT_PHOTOS = [
  "/images/events/networking.webp",
  "/images/events/discussion1.webp",
  "/images/events/discussion2.webp",
  "/images/events/discussion3.webp",
  "/images/events/discuusion4.webp",
  "/images/events/sharing-session.webp",
  "/images/events/wfc3.webp",
  "/images/events/wfc6.webp",
  "/images/events/wfc9.webp",
  "/images/events/fotobareng-2.webp",
] as const;

/** Foto hadir/dokumentasi — untuk kartu & detail artikel. */
const ARTICLE_PHOTOS = [
  "/images/content/prize1.webp",
  "/images/content/prize2.webp",
  "/images/content/prize3.webp",
  "/images/content/prize4.webp",
  "/images/content/prize5.webp",
] as const;

/**
 * Foto orang di `public/images/people/` — berkasnya dinamai sesuai orangnya,
 * jadi cocok dipakai sebagai foto pembicara event. Dipakai pemilih foto di
 * form admin (`EventForm`) dan seeder dummy, supaya keduanya menunjuk berkas
 * yang sama.
 */
export const PEOPLE_PHOTOS = [
  "/images/people/anto.jpg",
  "/images/people/dimas.jpg",
  "/images/people/fandi.jpg",
  "/images/people/gilang.jpeg",
  "/images/people/maulana.jpeg",
  "/images/people/speaker1.webp",
  "/images/people/speaker2.webp",
  "/images/people/speaker3.webp",
  "/images/people/speaker4.webp",
  "/images/people/speaker5.webp",
  "/images/people/speaker6c.webp",
  "/images/people/speaker7.webp",
  "/images/people/speaker8.webp",
  "/images/people/speaker9.webp",
  "/images/people/speaker10.webp",
] as const;

const POOLS: Record<ThumbnailKind, readonly string[]> = {
  event: EVENT_PHOTOS,
  project: PROJECT_PHOTOS,
  article: ARTICLE_PHOTOS,
};

/** FNV-1a ringan — cukup untuk menyebar seed ke seluruh panjang pool. */
function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return Math.abs(hash);
}

/**
 * Pilih thumbnail untuk satu konten. `seed` sebaiknya slug (atau judul) supaya
 * hasilnya stabil lintas render. Mengembalikan `null` kalau pool kosong.
 */
export function pickThumbnail(
  kind: ThumbnailKind,
  seed: string
): string | null {
  const pool = POOLS[kind];
  if (pool.length === 0) return null;
  return pool[hashSeed(seed) % pool.length] ?? null;
}
