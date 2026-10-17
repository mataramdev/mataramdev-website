import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Brand from "./Brand";
import Icon, { type IconName } from "@/components/ui/icons";

/**
 * Footer neo-brutalist — mengikuti mockup: latar navy (#12121E), mark logo +
 * wordmark teks, empat kolom (brand + Beranda + Komunitas + Temukan Kami),
 * dan baris bawah tipis.
 *
 * Alamat/maps diambil dari `community_settings`; kalau belum diisi, kolom
 * "Temukan Kami" tetap tampil dengan teks cadangan. Tautan sosial komunitas
 * dibaca dari `social_links` (`owner_type='community'`) dan selama belum ada
 * datanya memakai chip statis seperti di mockup.
 */

interface FooterProps {
  /** Community logo for the light theme (Task 9.3 / PRD §4.7). */
  lightLogoUrl?: string | null;
  /** Community logo for the dark theme. Falls back to the text wordmark. */
  darkLogoUrl?: string | null;
}

interface FooterLink {
  label: string;
  href?: string;
}

const BERANDA_LINKS: FooterLink[] = [
  { label: "Aktivitas", href: "/#aktivitas" },
  { label: "Artikel", href: "/artikel" },
  { label: "Event", href: "/event" },
];

const KOMUNITAS_LINKS: FooterLink[] = [
  { label: "Kontributor", href: "/anggota" },
  { label: "Resources", href: "/resource" },
  { label: "Projects", href: "/proyek" },
  { label: "Forum", href: undefined },
  { label: "Anggota", href: "/anggota" },
  { label: "Kontak", href: "/tentang" },
];

const FIND_ITEMS: { icon: IconName; label: string }[] = [
  { icon: "monitor", label: "WFC – Setiap Rabu" },
  { icon: "mic", label: "Meetup – Bulanan" },
  { icon: "rocket", label: "Terbuka untuk semua level" },
];

/** Chip sosial statis (placeholder mockup) — pakai ikon, bukan emoji. */
const STATIC_SOCIAL_CHIPS: { icon: IconName; label: string }[] = [
  { icon: "chat", label: "WhatsApp" },
  { icon: "send", label: "Telegram" },
  { icon: "github", label: "GitHub" },
];

/**
 * Petakan platform dari `social_links` ke ikon. Nama tak dikenal tetap dapat
 * ikon generik supaya chipnya tidak pernah kosong.
 */
function socialIcon(platform: string): IconName {
  const key = platform.trim().toLowerCase();

  if (key.includes("whatsapp")) return "chat";
  if (key.includes("telegram")) return "send";
  if (key.includes("instagram")) return "camera";
  if (key.includes("discord")) return "gamepad";
  if (key.includes("github")) return "github";
  if (key.includes("youtube")) return "video";
  if (key.includes("mail") || key.includes("email")) return "mail";

  return "external";
}

function FooterLinkList({ links }: { links: FooterLink[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {links.map((link) => (
        <li key={link.label}>
          {link.href ? (
            <Link
              href={link.href}
              className="text-sm text-white/75 hover:text-white"
            >
              {link.label}
            </Link>
          ) : (
            <span className="text-sm text-white/40" title="Segera hadir">
              {link.label}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function Heading({ children }: { children: string }) {
  return (
    <h5 className="mb-3 inline-block border-b-2 border-accent-500 pb-1.5 font-black text-sm uppercase tracking-wider text-accent-500">
      {children}
    </h5>
  );
}

export default async function Footer({
  lightLogoUrl,
  darkLogoUrl,
}: FooterProps) {
  const supabase = await createClient();

  const [settingsResult, socialResult] = await Promise.all([
    supabase
      .from("community_settings")
      .select("name, description, address, maps_location")
      .limit(1)
      .maybeSingle(),
    // Kegagalan baca tidak boleh menjatuhkan setiap halaman — cukup kembali ke
    // chip statis.
    supabase
      .from("social_links")
      .select("platform, url")
      .eq("owner_type", "community"),
  ]);

  const settings = settingsResult.data;
  const communityName = settings?.name || "Mataram Dev";
  const communityDesc =
    settings?.description ||
    "Komunitas maker, designer & inovator berbasis di Mataram, Lombok — Indonesia.";
  const socialLinks = (socialResult.data ?? []) as {
    platform: string;
    url: string;
  }[];

  // Footer selalu berlatar navy, jadi varian gelap yang dipakai lebih dulu
  // (dengan cadangan varian terang). Sama seperti Navbar: ini hanya mark-nya,
  // wordmark tetap dirender sebagai teks dua warna oleh `<Brand>`.
  const logo = darkLogoUrl || lightLogoUrl || "/images/logo/mark-dark.svg";

  return (
    <footer className="bg-brand-footer text-white">
      <div className="mx-auto grid max-w-[1360px] gap-8 px-5 py-14 sm:grid-cols-2 sm:px-10 lg:grid-cols-[1.3fr_0.9fr_0.9fr_1.1fr]">
        {/* Brand */}
        <div>
          <Link
            href="/"
            className="mb-4 flex items-center gap-2.5 font-black text-lg uppercase tracking-tight"
          >
            <Brand
              name={communityName}
              lightLogo={logo}
              darkLogo={logo}
              variant="dark-surface"
              markClass="h-10"
              textClass="text-lg"
            />
          </Link>
          <p className="mb-5 max-w-[32ch] text-sm leading-relaxed text-white/70">
            {communityDesc}
          </p>
          <div className="flex flex-wrap gap-2">
            {socialLinks.length > 0
              ? socialLinks.map((link) => (
                  <a
                    key={`${link.platform}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 border-2 border-white/30 bg-white/5 px-4 py-2.5 font-black text-xs uppercase hover:border-white/70"
                  >
                    <Icon name={socialIcon(link.platform)} className="size-4" />
                    {link.platform}
                  </a>
                ))
              : // Chip statis seperti mockup; belum ada UI admin untuk mengisi
                // sosial komunitas, jadi ini placeholder yang sama.
                STATIC_SOCIAL_CHIPS.map((chip) => (
                  <span
                    key={chip.label}
                    className="flex items-center gap-2 border-2 border-white/30 bg-white/5 px-4 py-2.5 font-black text-xs uppercase text-white/60"
                    title="Segera hadir"
                  >
                    <Icon name={chip.icon} className="size-4" />
                    {chip.label}
                  </span>
                ))}
          </div>
        </div>

        {/* Beranda */}
        <div>
          <Heading>Beranda</Heading>
          <FooterLinkList links={BERANDA_LINKS} />
        </div>

        {/* Komunitas */}
        <div>
          <Heading>Komunitas</Heading>
          <FooterLinkList links={KOMUNITAS_LINKS} />
        </div>

        {/* Temukan Kami */}
        <div>
          <Heading>Temukan Kami</Heading>
          <p className="mb-4 flex gap-2 text-sm leading-relaxed text-white/75">
            <Icon name="mapPin" className="mt-0.5 size-4 shrink-0" />
            <span>
              {settings?.address ||
                "Kota Mataram, Nusa Tenggara Barat — Indonesia"}
            </span>
          </p>
          <div className="mb-4 flex flex-col gap-1.5">
            {FIND_ITEMS.map((item) => (
              <span
                key={item.label}
                className="flex items-center gap-2 text-xs text-white/70"
              >
                <Icon name={item.icon} className="size-4 shrink-0" />
                {item.label}
              </span>
            ))}
          </div>
          {settings?.maps_location && (
            <div className="mb-4 overflow-hidden border-2 border-white/30">
              <iframe
                src={settings.maps_location}
                title="Peta lokasi komunitas"
                width="100%"
                height="110"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
          <Link
            href="/register"
            className="block w-full border-[3px] border-accent-500 bg-accent-500 px-4 py-3.5 text-center font-black text-sm uppercase text-white"
          >
            Bergabung Sekarang →
          </Link>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1360px] flex-wrap justify-between gap-2 border-t border-white/15 px-5 py-5 text-xs text-white/40 sm:px-10">
        <span>
          © {new Date().getFullYear()} {communityName}
        </span>
        <span>Diberdayakan oleh komunitas.</span>
      </div>
    </footer>
  );
}
