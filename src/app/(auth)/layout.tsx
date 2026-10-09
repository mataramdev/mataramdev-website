import Link from "next/link";
import Brand from "@/components/layout/Brand";
import { getCommunityBranding } from "@/lib/communitySettings";

/**
 * Halaman login/daftar tidak lagi mewarisi Navbar publik (chrome situs sekarang
 * ada di route group `(public)`), jadi brand di atas kartu ini yang menjadi
 * jalan pulang — tanpa itu pengguna yang salah masuk halaman hanya bisa
 * menekan tombol back browser.
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const branding = await getCommunityBranding();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-surface-3 px-5 py-16">
      <Link href="/" className="flex items-center gap-2.5">
        <Brand
          name={branding.name}
          lightLogo={branding.lightLogoUrl}
          darkLogo={branding.darkLogoUrl}
          markClass="h-9"
          textClass="text-[17px]"
        />
      </Link>

      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
