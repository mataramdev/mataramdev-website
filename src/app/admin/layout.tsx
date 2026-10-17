import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { accountBlockReason, loginBlockedPath } from "@/lib/accountStatus";
import { adminSections } from "@/lib/dashboardNav";
import { getCommunityBranding } from "@/lib/communitySettings";
import Brand from "@/components/layout/Brand";
import DashboardShell from "@/components/layout/DashboardShell";

export const metadata = {
  title: "Panel Admin",
};

/**
 * Guard + kerangka panel admin.
 *
 * Guard-nya berlapis dan sengaja tidak bergantung pada middleware saja: sesi
 * yang sah milik akun yang belum disetujui / sudah dinonaktifkan tetap lolos
 * `auth.getUser()`, jadi keputusannya diulang di sini dengan aturan yang sama
 * (`accountBlockReason`).
 *
 * Navigasinya berupa sidebar (`DashboardShell`) supaya seluruh halaman admin
 * terjangkau tanpa menghafal URL — sebelumnya hanya ada deretan tombol di atas
 * halaman, dan `/admin` sendiri tidak punya halaman awal.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Tanpa `redirectedFrom`: `src/proxy.ts` sudah mengisi tujuan aslinya. Layout
  // ini adalah pengaman kedua untuk path yang tidak dicakup proxy, jadi cukup
  // arahkan ke halaman masuk.
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("fullname, role, is_active, approval_status")
    .eq("id", user.id)
    .single();

  const blocked = accountBlockReason(profile);
  if (blocked) {
    redirect(loginBlockedPath(blocked));
  }

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Dua angka untuk badge sidebar (moderasi proyek + pendaftar yang menunggu
  // persetujuan). Non-fatal: kegagalan hitung tidak boleh menjatuhkan seluruh
  // panel, cukup tampil tanpa badge.
  const [projects, pendingUsers] = await Promise.all([
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "pending"),
  ]);

  if (projects.error) {
    console.error("[AdminLayout] pending project count failed:", projects.error);
  }
  if (pendingUsers.error) {
    console.error("[AdminLayout] pending user count failed:", pendingUsers.error);
  }

  const branding = await getCommunityBranding();

  return (
    <DashboardShell
      brand={
        <Brand
          name={branding.name}
          lightLogo={branding.lightLogoUrl}
          darkLogo={branding.darkLogoUrl}
          markClass="h-8"
          textClass="text-[15px]"
        />
      }
      rootLabel="Admin"
      sections={adminSections({
        pendingProjects: projects.count ?? 0,
        pendingUsers: pendingUsers.count ?? 0,
      })}
      user={{
        name: profile?.fullname ?? user.email ?? "Admin",
        email: user.email ?? "",
        role: "admin",
      }}
    >
      {children}
    </DashboardShell>
  );
}
