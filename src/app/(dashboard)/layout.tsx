import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { accountBlockReason, loginBlockedPath } from "@/lib/accountStatus";
import { memberSections } from "@/lib/dashboardNav";
import { getCommunityBranding } from "@/lib/communitySettings";
import Brand from "@/components/layout/Brand";
import DashboardShell from "@/components/layout/DashboardShell";

export const metadata = {
  title: "Dashboard",
};

/**
 * Guard + kerangka dashboard member.
 *
 * Sama seperti panel admin, keputusan "boleh masuk atau tidak" diulang di sini
 * (bukan hanya di middleware) karena sesi Supabase yang sah tidak tahu apa-apa
 * soal `approval_status` dan `is_active`.
 *
 * Navigasinya sidebar supaya Profil / Proyek Saya / Artikel Saya / tulis baru
 * terjangkau tanpa mengetik URL — sebelumnya halaman-halaman ini hanya bisa
 * dicapai dari tautan teks di Navbar publik.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Tanpa `redirectedFrom`: `src/proxy.ts` sudah mengisi tujuan aslinya untuk
  // path yang dicakupnya. Layout ini pengaman kedua (mis. /artikel/baru dan
  // /proyek/baru, yang bukan path terdaftar di proxy).
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

  const role = profile?.role === "admin" ? "admin" : "contributor";
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
      rootLabel="Dashboard"
      sections={memberSections(role)}
      user={{
        name: profile?.fullname ?? user.email ?? "Anggota",
        email: user.email ?? "",
        role,
      }}
    >
      {children}
    </DashboardShell>
  );
}
