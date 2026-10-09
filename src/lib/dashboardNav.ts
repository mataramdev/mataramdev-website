import type { IconName } from "@/components/ui/icons";

/**
 * Definisi menu sidebar, dipisah dari komponennya supaya layout server (yang
 * tahu role dan jumlah item yang menunggu tindakan) bisa membangun daftarnya
 * tanpa mengirim fungsi/JSX ke klien — cukup data.
 */

export interface SidebarItem {
  label: string;
  href: string;
  icon: IconName;
  /** Angka kecil di kanan item — mis. jumlah yang menunggu tindakan. */
  badge?: number;
}

export interface SidebarSection {
  /** Judul kelompok menu; kosongkan untuk kelompok pertama tanpa judul. */
  heading?: string;
  items: SidebarItem[];
}

/**
 * Menu panel admin. "Ringkasan" diarahkan ke `/admin` (halaman awal panel) —
 * sebelumnya `/admin` tidak punya halaman sama sekali, jadi tidak ada pintu
 * masuk selain menghafal URL tiap sub-halaman.
 */
export function adminSections(counts: {
  pendingProjects: number;
  pendingUsers: number;
}): SidebarSection[] {
  return [
    {
      items: [
        { label: "Ringkasan", href: "/admin", icon: "layout" },
        { label: "Dashboard Saya", href: "/dashboard", icon: "monitor" },
      ],
    },
    {
      heading: "Konten",
      items: [
        { label: "Event", href: "/admin/event", icon: "calendar" },
        {
          label: "Moderasi Proyek",
          href: "/admin/proyek",
          icon: "package",
          badge: counts.pendingProjects,
        },
        { label: "Resource", href: "/admin/resource", icon: "download" },
        { label: "FAQ", href: "/admin/faq", icon: "chat" },
        { label: "Aktivitas", href: "/admin/aktivitas", icon: "sparkle" },
      ],
    },
    {
      heading: "Komunitas",
      items: [
        {
          label: "Pengguna",
          href: "/admin/users",
          icon: "users",
          badge: counts.pendingUsers,
        },
        { label: "Stack", href: "/admin/stack", icon: "layers" },
        { label: "Pengaturan", href: "/admin/pengaturan", icon: "target" },
        { label: "Kit Design", href: "/admin/design", icon: "palette" },
      ],
    },
  ];
}

/** Menu dashboard member. Admin mendapat pintasan balik ke panelnya. */
export function memberSections(role: "admin" | "contributor"): SidebarSection[] {
  const sections: SidebarSection[] = [
    {
      items: [{ label: "Ringkasan", href: "/dashboard", icon: "layout" }],
    },
    {
      heading: "Karya Saya",
      items: [
        { label: "Proyek Saya", href: "/proyek-saya", icon: "package" },
        { label: "Artikel Saya", href: "/artikel-saya", icon: "pen" },
        { label: "Kirim Proyek", href: "/proyek/baru", icon: "rocket" },
        { label: "Tulis Artikel", href: "/artikel/baru", icon: "book" },
      ],
    },
    {
      heading: "Akun",
      items: [
        { label: "Profil", href: "/profil", icon: "user" },
        { label: "Anggota Lain", href: "/anggota", icon: "users" },
      ],
    },
  ];

  if (role === "admin") {
    sections.push({
      heading: "Admin",
      items: [{ label: "Panel Admin", href: "/admin", icon: "shield" }],
    });
  }

  return sections;
}
