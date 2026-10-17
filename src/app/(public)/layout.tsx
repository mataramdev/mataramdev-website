import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { getCommunityBranding } from "@/lib/communitySettings";

/**
 * Kerangka halaman publik: Navbar + konten + Footer.
 *
 * Dulu ketiganya dipasang di root layout, jadi halaman admin dan dashboard
 * member juga ikut kena header/footer publik. Sekarang chrome situs publik
 * hanya ada di route group ini, dan panel dashboard memakai sidebar sendiri.
 *
 * `isLoggedIn` / `isAdmin` dibaca di server supaya Navbar tidak perlu fetch
 * sesi dari browser (dan tidak ada kedipan tombol "Masuk" pada halaman yang
 * sudah login).
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  // Community branding (Task 9.3 / PRD §4.7). Satu query per request, sama
  // dengan yang dibaca generateMetadata; gagal baca jatuh ke wordmark teks.
  const { name, lightLogoUrl, darkLogoUrl } = await getCommunityBranding();

  return (
    <>
      <Navbar
        isLoggedIn={!!user}
        isAdmin={isAdmin}
        name={name}
        lightLogoUrl={lightLogoUrl}
        darkLogoUrl={darkLogoUrl}
      />
      <div className="flex-1">{children}</div>
      <Footer lightLogoUrl={lightLogoUrl} darkLogoUrl={darkLogoUrl} />
    </>
  );
}
