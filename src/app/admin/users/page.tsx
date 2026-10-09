import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { setUserApproval, setUserRole, setUserActive } from "@/lib/actions/users";
import { APPROVAL_LABELS } from "@/lib/accountStatus";
import { BTN_SM_BASE } from "@/components/ui/brutalist";

export const metadata = {
  title: "Pengguna — Admin",
};

type ApprovalStatus = "pending" | "approved" | "rejected";

interface AdminUserRow {
  id: string;
  fullname: string | null;
  username: string | null;
  email: string | null;
  role: "admin" | "contributor";
  is_active: boolean;
  approval_status: ApprovalStatus;
  created_at: string;
}

interface AdminUsersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Task 9.2 (PRD §4.1): admin manage user — list, ubah role, aktif/nonaktif,
 * dan **setujui pendaftaran**.
 *
 * Sejak pendaftaran tidak lagi otomatis bisa dipakai, kolom Persetujuan ini
 * yang jadi tindakan pertama yang dicari admin: baris `pending` selalu
 * didahulukan RPC-nya, dan ada ringkasan jumlahnya di atas tabel.
 *
 * The list comes from the `admin_list_users()` RPC (SECURITY DEFINER) because
 * `users.email` is revoked for anon AND authenticated (policies.sql section 1)
 * — a plain select("email") would answer 42501 even for an admin.
 *
 * Actions run directly in the form (no client wrapper) so everything works
 * without JS; outcome is reported via ?updated= / ?error= redirect params.
 */
export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const params = await searchParams;
  const updated = typeof params.updated === "string" ? params.updated : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error: rpcError } = await supabase.rpc("admin_list_users");

  // RLS/RPC failure is an error boundary, not an empty table — "no users"
  // would be a lie when the backend is what broke.
  if (rpcError) {
    throw new Error(`Gagal memuat daftar pengguna: ${rpcError.message}`);
  }

  const users = (data ?? []) as AdminUserRow[];
  const pendingCount = users.filter((u) => u.approval_status === "pending").length;

  const banners: Record<string, string> = {
    role: "Role pengguna diperbarui.",
    activated: "Akun diaktifkan kembali — pemiliknya bisa login.",
    deactivated: "Akun dinonaktifkan — pemiliknya tidak bisa login lagi.",
    approved:
      "Pendaftaran disetujui — pemiliknya sekarang bisa login (asal emailnya sudah diverifikasi).",
    rejected: "Pendaftaran ditolak — pemiliknya tidak bisa login.",
    pending: "Akun dikembalikan ke daftar tunggu persetujuan.",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-black uppercase leading-none text-2xl">Pengguna</h1>
        <p className="mt-1 text-sm text-muted">
          Setujui pendaftar baru, atur role, dan aktif/nonaktifkan akun.
          Pendaftar tidak bisa login sampai disetujui di sini; menonaktifkan akun
          memblokir login berikutnya (sesi yang sedang berjalan juga dibuang saat
          halaman dashboard berikutnya dimuat).
        </p>
      </div>

      {pendingCount > 0 && (
        <div className="rounded-btn border-[3px] border-[var(--hard-border)] bg-brand-gold p-4 text-sm text-black">
          <strong className="font-black">{pendingCount} pendaftar</strong> menunggu
          persetujuan. Barisnya ada di paling atas daftar.
        </div>
      )}

      {updated && banners[updated] && (
        <div className="rounded-btn border-[3px] border-[var(--hard-border)] bg-brand-green p-3 text-sm text-white">
          {banners[updated]}
        </div>
      )}

      {error && (
        <div className="rounded-btn border-[3px] border-[var(--hard-border)] bg-accent-700 p-3 text-sm text-white">
          {error}
        </div>
      )}

      {users.length === 0 ? (
        <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-8 text-center text-sm text-muted">
          Belum ada pengguna terdaftar.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--hard-border)] bg-surface-3 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Pengguna</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Persetujuan</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Bergabung</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hard-border)]">
              {users.map((u) => {
                const isSelf = u.id === user?.id;
                return (
                  <tr
                    key={u.id}
                    className={
                      u.approval_status === "pending" ? "bg-brand-gold/20" : ""
                    }
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">
                        {u.fullname || "(tanpa nama)"}
                      </div>
                      <div className="text-xs text-muted">
                        {u.email}
                        {u.username && (
                          <span className="ml-1.5">@{u.username}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                          u.role === "admin"
                            ? "border-2 border-[var(--hard-border)] bg-brand-purple text-white"
                            : "bg-surface-3 text-foreground"
                        }`}
                      >
                        {u.role === "admin" ? "Admin" : "Contributor"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ApprovalBadge status={u.approval_status} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                          u.is_active
                            ? "border-2 border-[var(--hard-border)] bg-brand-green text-white"
                            : "border-2 border-[var(--hard-border)] bg-accent-500 text-white"
                        }`}
                      >
                        {u.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      {isSelf ? (
                        <span className="text-xs text-muted">
                          akunmu sendiri
                        </span>
                      ) : (
                        <div className="flex flex-wrap justify-end gap-2">
                          {/* Persetujuan datang lebih dulu: tanpa ini akun baru
                              tidak bisa apa-apa, seberapa pun role/statusnya. */}
                          {u.approval_status !== "approved" && (
                            <form action={setUserApproval} className="inline">
                              <input type="hidden" name="userId" value={u.id} />
                              <input type="hidden" name="status" value="approved" />
                              <button
                                type="submit"
                                className={`${BTN_SM_BASE} bg-brand-green text-white`}
                              >
                                Setujui
                              </button>
                            </form>
                          )}
                          {u.approval_status !== "rejected" && (
                            <form action={setUserApproval} className="inline">
                              <input type="hidden" name="userId" value={u.id} />
                              <input type="hidden" name="status" value="rejected" />
                              <button
                                type="submit"
                                className={`${BTN_SM_BASE} bg-accent-500 text-white`}
                              >
                                Tolak
                              </button>
                            </form>
                          )}

                          {/* Plain forms → work without client JS. The RPCs
                              refuse self-changes, so own-row buttons are not
                              even rendered. */}
                          <form action={setUserRole} className="inline">
                            <input type="hidden" name="userId" value={u.id} />
                            <input
                              type="hidden"
                              name="role"
                              value={u.role === "admin" ? "contributor" : "admin"}
                            />
                            <button type="submit" className={`${BTN_SM_BASE} bg-surface-2`}>
                              {u.role === "admin"
                                ? "Jadikan Contributor"
                                : "Jadikan Admin"}
                            </button>
                          </form>

                          {/* Aktif/nonaktif hanya bermakna untuk akun yang
                              sudah disetujui: akun `pending` memang selalu
                              nonaktif, dan tombol "Aktifkan" di sini akan
                              menyesatkan — mengaktifkannya tidak membuat
                              mereka bisa masuk selama belum disetujui. */}
                          {u.approval_status === "approved" && (
                            <form action={setUserActive} className="inline">
                              <input type="hidden" name="userId" value={u.id} />
                              <input
                                type="hidden"
                                name="active"
                                value={u.is_active ? "false" : "true"}
                              />
                              <button
                                type="submit"
                                className={`${BTN_SM_BASE} bg-surface-2`}
                              >
                                {u.is_active ? "Nonaktifkan" : "Aktifkan"}
                              </button>
                            </form>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted">
        Role dan status tidak bisa diubah lewat REST biasa (kolomnya tidak di-
        grant untuk UPDATE) — semua perubahan lewat fungsi admin yang memeriksa
        role di server. Akun yang sudah punya konten tidak bisa dihapus; cukup
        nonaktifkan.{" "}
        <Link
          href="/admin"
          className="font-medium text-teal-600 hover:underline dark:text-teal-300"
        >
          ← Kembali ke ringkasan
        </Link>
      </p>
    </div>
  );
}

function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const styles: Record<ApprovalStatus, string> = {
    pending: "border-2 border-[var(--hard-border)] bg-brand-gold text-black",
    approved: "border-2 border-[var(--hard-border)] bg-brand-green text-white",
    rejected: "border-2 border-[var(--hard-border)] bg-accent-700 text-white",
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${styles[status]}`}
    >
      {APPROVAL_LABELS[status] ?? status}
    </span>
  );
}
