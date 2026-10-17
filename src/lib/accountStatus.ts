/**
 * Satu sumber kebenaran untuk "boleh masuk atau tidak".
 *
 * Dipakai di empat tempat yang berbeda, dan sebelumnya masing-masing punya
 * tebakan sendiri: `login` (server action), `middleware.ts`, layout
 * `(dashboard)`/`admin`, dan `/auth/callback`. Kalau aturannya ditulis ulang di
 * tiap tempat, cepat atau lambat ada satu yang ketinggalan — dan yang
 * ketinggalan itu justru jadi pintu masuk.
 *
 * Dipisah dari `src/lib/db/schema.ts` supaya modul ini bisa diimpor komponen
 * klien (halaman login) tanpa ikut menarik drizzle.
 */

/** Alasan sebuah akun ditolak masuk. Semuanya bisa ditampilkan ke pengguna. */
export type AccountBlock = "pending" | "rejected" | "deactivated";

/** Bentuk minimal baris `public.users` yang dibutuhkan untuk memutuskan. */
export interface AccountFlags {
  is_active?: boolean | null;
  approval_status?: string | null;
}

/**
 * `null` berarti akun boleh masuk.
 *
 * Urutannya penting: `pending`/`rejected` diperiksa lebih dulu daripada
 * `is_active`, karena akun yang belum disetujui masih `is_active = true`
 * (default kolom) — kalau `is_active` dicek duluan, pendaftar baru akan lolos.
 */
export function accountBlockReason(
  profile: AccountFlags | null | undefined,
): AccountBlock | null {
  // Baris profil tidak ada = keadaan yang tidak dikenali. Menolak lebih aman
  // daripada membiarkan akun tanpa data masuk.
  if (!profile) return "deactivated";

  if (profile.approval_status === "pending") return "pending";
  if (profile.approval_status === "rejected") return "rejected";
  if (!profile.is_active) return "deactivated";

  return null;
}

/**
 * Kalimat yang ditampilkan ke pengguna. Ditulis sekali di sini supaya halaman
 * login, server action, dan redirect dari layout tidak pernah berbeda kata.
 */
export const ACCOUNT_BLOCK_MESSAGES: Record<AccountBlock, string> = {
  pending:
    "Pendaftaranmu masih menunggu persetujuan admin. Setelah disetujui, kamu bisa masuk dengan email dan password yang tadi kamu daftarkan.",
  rejected:
    "Pendaftaran akun ini ditolak oleh admin. Hubungi admin komunitas kalau menurutmu ini keliru.",
  deactivated:
    "Akun ini dinonaktifkan oleh admin. Hubungi admin kalau ingin mengaktifkan kembali.",
};

/** Label pendek untuk badge di daftar pengguna admin. */
export const APPROVAL_LABELS: Record<string, string> = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
};

/** Query string yang dipakai semua redirect saat akun diblokir. */
export function loginBlockedPath(reason: AccountBlock, extra?: string): string {
  const params = new URLSearchParams({ blocked: reason });
  if (extra) params.set(extra, "1");
  return `/login?${params.toString()}`;
}
