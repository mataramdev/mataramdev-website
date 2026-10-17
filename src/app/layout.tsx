import type { Metadata } from "next";
import { Archivo, Space_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/layout/ThemeProvider";
import { getCommunityBranding } from "@/lib/communitySettings";
import { getSiteUrl, toMetaDescription } from "@/lib/seo";

// Pasangan brutalist: grotesque tebal (Archivo, wght 100-900) untuk judul
// sekaligus body, monospace (Space Mono) untuk label/meta/code. Keduanya
// self-host lewat next/font — tidak ada permintaan ke CDN dan tidak ada layout
// shift. Ganti di sini saja kalau brief design minta font lain.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const SITE_DESCRIPTION =
  "Platform komunitas developer & designer Kota Mataram, NTB";

/**
 * Root layout sengaja TIDAK memuat Navbar/Footer.
 *
 * Navbar publik sekarang hidup di `(public)/layout.tsx`, dan panel admin /
 * dashboard member memakai sidebar sendiri (`DashboardShell`). Kalau keduanya
 * dipasang di root, setiap halaman dashboard akan menampilkan header dan footer
 * situs publik di atas sidebar — bukan bentuk dashboard pada umumnya.
 *
 * Default metadata for every page (Task 9.4 / PRD §5).
 *
 * `metadataBase` makes relative OG/canonical URLs absolute, and the default OG
 * image falls back to the community logo when one has been uploaded; without
 * one, social cards simply carry title + description instead of a broken link.
 * Pages below override `title`/`description`/`openGraph` for their own rows.
 */
export async function generateMetadata(): Promise<Metadata> {
  const branding = await getCommunityBranding();
  const logo = branding.lightLogoUrl || branding.darkLogoUrl;
  const description =
    toMetaDescription(branding.description, 200) || SITE_DESCRIPTION;

  return {
    metadataBase: getSiteUrl(),
    title: {
      default: branding.name,
      template: `%s | ${branding.name}`,
    },
    description,
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: branding.name,
      title: branding.name,
      description,
      images: logo ? [{ url: logo }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: branding.name,
      description,
      images: logo ? [logo] : undefined,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${archivo.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
