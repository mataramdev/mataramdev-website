#!/usr/bin/env node
/**
 * Dummy content seeder — `pnpm db:seed:dummy`.
 *
 * Fills an empty (or freshly seeded) database with realistic-looking content so
 * the public pages can be reviewed without hand-entering everything:
 *
 *   members (6, each able to sign in)   events (7) + RSVP rows
 *   projects (5 approved, 2 pending)    articles (7 published, tagged)
 *   free resources (5)                  FAQ (6) and activities (6)
 *   social links for every member
 *
 * Deliberately separate from `scripts/seed.mjs`: that one creates the admin and
 * the settings row a real deployment needs, while everything here is throwaway
 * demo data you can wipe again with `pnpm db:seed:dummy --reset`.
 *
 * Only `DATABASE_URL` is required (same as `pnpm db:seed`) — no service role
 * key. Re-running is safe: rows are matched on their slug / name / question, so
 * they are updated instead of duplicated.
 *
 * Overrides via environment variables (or `.env.local`):
 *
 *   SEED_DUMMY_PASSWORD=...        # password for every dummy member
 *   SEED_DUMMY_ADMIN_BIO=...       # bio written to the admin profile when empty
 *   SEED_DUMMY_RESET=true          # delete the dummy data instead of writing it
 *
 * Images (`image_url`, `avatar`) are intentionally left empty: uploads live in
 * Supabase Storage, which needs credentials this script does not have. Every
 * page renders its own fallback (initials, icon) for a missing image.
 */

import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import postgres from "postgres";

// ─── Config ───────────────────────────────────────────────

/** Loads a dotenv-style file without overriding variables already set. */
function loadEnvFile(path) {
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;

    process.env[key] = rawValue.replace(/^(['"])(.*)\1$/, "$2");
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const RESET =
  process.argv.includes("--reset") || process.env.SEED_DUMMY_RESET === "true";

/** Every dummy member shares this password so the demo is easy to hand out. */
const MEMBER_PASSWORD = process.env.SEED_DUMMY_PASSWORD ?? "mataramdev123";

/** All dummy accounts use this domain, which keeps them easy to spot. */
const EMAIL_DOMAIN = "demo.mataramdev.id";

const DAY = 24 * 60 * 60 * 1000;

/**
 * Dates are relative to "now" so a re-run always produces a fresh-looking site
 * (an upcoming event in the past would drop off the landing page).
 */
function at(dayOffset, hour = 9, minute = 0) {
  const date = new Date(Date.now() + dayOffset * DAY);
  date.setHours(hour, minute, 0, 0);
  return date;
}

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL belum diisi. Jalankan `pnpm db:seed` dulu, lalu ulangi.\n",
  );
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1, onnotice: () => {} });

const log = (label, message) => console.log(`   ${label.padEnd(11)} ${message}`);

// ─── Data ─────────────────────────────────────────────────

/** Demo members. Each one gets a real, signable-in account. */
const MEMBERS = [
  {
    username: "aldi",
    fullname: "Aldi Pratama",
    bio: "Frontend engineer yang suka ngoprek Next.js dan bikin animasi CSS yang halus.",
    joinedDaysAgo: 420,
    socials: [
      ["github", "https://github.com/aldipratama"],
      ["linkedin", "https://www.linkedin.com/in/aldipratama"],
    ],
  },
  {
    username: "baiqnurul",
    fullname: "Baiq Nurul Aini",
    bio: "Mobile developer. Sehari-hari pegang Flutter, sesekali ngintip Kotlin.",
    joinedDaysAgo: 365,
    socials: [
      ["github", "https://github.com/baiqnurul"],
      ["instagram", "https://instagram.com/baiqnurul.dev"],
    ],
  },
  {
    username: "rifqi",
    fullname: "Muhammad Rifqi",
    bio: "Backend engineer — Go, PostgreSQL, dan API yang enak dipakai orang lain.",
    joinedDaysAgo: 500,
    socials: [
      ["github", "https://github.com/rifqimuhammad"],
      ["website", "https://rifqi.dev"],
    ],
  },
  {
    username: "dinda",
    fullname: "Dinda Lestari",
    bio: "UI/UX designer. Senang membangun design system yang rapi dan konsisten.",
    joinedDaysAgo: 300,
    socials: [
      ["instagram", "https://instagram.com/dinda.lestari.ui"],
      ["website", "https://dindalestari.design"],
    ],
  },
  {
    username: "zaki",
    fullname: "Zaki Maulana",
    bio: "DevOps & infra. Cita-citanya bikin deployment jadi satu perintah saja.",
    joinedDaysAgo: 240,
    socials: [
      ["github", "https://github.com/zakimaulana"],
      ["linkedin", "https://www.linkedin.com/in/zakimaulana"],
    ],
  },
  {
    username: "dewi",
    fullname: "Dewi Anggraini",
    bio: "Data analyst. Python, SQL, dan dashboard yang gampang dibaca orang awam.",
    joinedDaysAgo: 180,
    socials: [
      ["github", "https://github.com/dewianggraini"],
      ["twitter", "https://x.com/dewianggraini"],
    ],
  },
];

/** Demo events, one per status so every filter chip has something to show. */
const EVENTS = [
  {
    slug: "ngobrol-santai-framework-2026",
    title: "Ngobrol Santai: Framework Mana yang Layak Dipelajari di 2026?",
    status: "upcoming",
    startTime: at(7, 19, 0),
    endTime: at(7, 21, 0),
    locationName: "Kopi Senja, Jl. Pejanggik, Mataram",
    locationUrl: "https://maps.google.com/?q=Kopi+Senja+Mataram",
    excerpt:
      "Diskusi santai soal tren framework frontend dan backend tahun ini — tanpa slide, tanpa jargon.",
    description: `Kami duduk bareng, pesan kopi, lalu ngobrol soal pilihan teknologi.

Beberapa pertanyaan yang bakal dibahas:

- Apakah React masih jadi pilihan pertama di 2026?
- Svelte dan Vue sekarang dipakai di mana saja?
- Backend: Node.js, Go, atau Laravel?
- Bagaimana cara memilih tanpa ikut-ikutan hype?

Formatnya bebas: siapa pun boleh motong dan berbagi pengalaman.`,
    rsvp: {
      going: ["aldi", "rifqi", "dinda", "zaki", "dewi"],
      cancelled: ["baiqnurul"],
    },
  },
  {
    slug: "workshop-nextjs-app-router",
    title: "Workshop Next.js: App Router dari Nol",
    status: "upcoming",
    startTime: at(21, 9, 0),
    endTime: at(21, 15, 0),
    locationName: "Dinas Kominfo NTB, Mataram",
    locationUrl: "https://maps.google.com/?q=Dinas+Kominfo+NTB",
    excerpt:
      "Satu hari penuh belajar App Router: Server Component, Server Action, dan cara menaruh data dengan rapi.",
    description: `Workshop praktik — bawa laptop, bukan sekadar menonton.

Materi:

- Struktur folder App Router dan kapan memakai Server vs Client Component
- Mengambil data langsung di server (tanpa \`useEffect\`)
- Server Action untuk form tanpa API route
- Deploy ke Vercel dan menaruh environment variable

Peserta diharapkan sudah pernah menulis React dasar. Kuota 30 orang.`,
    rsvp: { going: ["aldi", "rifqi", "dinda", "zaki"] },
  },
  {
    slug: "workshop-flutter-pemula",
    title: "Workshop Flutter untuk Pemula",
    status: "upcoming",
    startTime: at(40, 9, 0),
    endTime: at(40, 14, 0),
    locationName: "Fakultas Teknik, Universitas Mataram",
    locationUrl: "https://maps.google.com/?q=Universitas+Mataram",
    excerpt:
      "Dari instalasi sampai aplikasi pertama yang jalan di HP sendiri, dalam satu hari.",
    description: `Kelas pemula untuk yang belum pernah menyentuh Flutter.

Yang akan kita kerjakan:

1. Memasang Flutter SDK dan menjalankan emulator
2. Memahami widget dasar (Container, Row, Column, ListView)
3. Mengambil data dari API dan menampilkannya
4. Build APK dan memasangnya di HP masing-masing

Tidak perlu pengalaman mobile sebelumnya.`,
    rsvp: { going: ["baiqnurul", "dinda", "dewi"] },
  },
  {
    slug: "hackathon-lombok-2026",
    title: "Hackathon Lombok 2026",
    status: "ongoing",
    startTime: at(-1, 8, 0),
    endTime: at(1, 18, 0),
    locationName: "Lombok Epicentrum Mall, Mataram",
    locationUrl: "https://maps.google.com/?q=Lombok+Epicentrum+Mall",
    excerpt:
      "48 jam membangun solusi untuk pariwisata berkelanjutan bersama 20 tim.",
    description: `Hackathon tahunan komunitas, digelar 48 jam non-stop.

Tema tahun ini: **pariwisata berkelanjutan di Lombok**.

- 20 tim, maksimal 4 orang per tim
- Mentor dari komunitas berkeliling setiap 6 jam
- Penjurian: dampak, kejelasan ide, dan kualitas eksekusi
- Hadiah utama untuk 3 tim terbaik

Tim yang datang tanpa anggota tetap boleh bergabung lewat sesi *team matching*.`,
    rsvp: {
      going: ["aldi", "rifqi", "dinda", "zaki"],
      cancelled: ["baiqnurul"],
    },
  },
  {
    slug: "sharing-sesi-karier-it",
    title: "Sharing Sesi: Karier IT Setelah Lulus — Cerita Alumni",
    status: "completed",
    startTime: at(-30, 19, 30),
    endTime: at(-30, 21, 0),
    locationName: "Online (Zoom)",
    locationUrl: "https://zoom.us/",
    excerpt:
      "Lima alumni kampus Mataram bercerita soal magang, kerja remote, dan pindah ke Jakarta.",
    description: `Sesi online bareng lima alumni yang sekarang bekerja di tempat berbeda.

Cerita yang dibagikan:

- Menyiapkan portofolio yang dilihat rekruter
- Ikut magang sambil kuliah: realistis atau tidak?
- Kerja remote untuk perusahaan luar negeri
- Merantau ke Jakarta: biaya, ritme, dan mentalnya

Rekaman sesi dibagikan di halaman Resource setelah acara selesai.`,
  },
  {
    slug: "kopdar-perdana-mataram-dev",
    title: "Kopdar Perdana Mataram Dev",
    status: "completed",
    startTime: at(-150, 16, 0),
    endTime: at(-150, 19, 0),
    locationName: "Taman Kota Mataram",
    locationUrl: "https://maps.google.com/?q=Taman+Kota+Mataram",
    excerpt:
      "Pertemuan pertama komunitas: 14 orang, satu piknik, dan banyak ide proyek bareng.",
    description: `Awal mula komunitas ini berjalan.

Yang terjadi sore itu:

- Perkenalan 14 orang dari latar belakang berbeda (mahasiswa, freelancer, karyawan)
- Sesi peta ide: apa yang paling dibutuhkan developer lokal
- Menyusun rencana kopdar bulanan dan satu workshop per kuartal

Terima kasih untuk semua yang datang lebih awal dan membawa tikar.`,
  },
  {
    slug: "belajar-deploy-vps",
    title: "Belajar Deploy Sendiri ke VPS",
    status: "cancelled",
    startTime: at(-5, 9, 0),
    endTime: at(-5, 13, 0),
    locationName: "Coworking Space Mataram",
    locationUrl: "https://maps.google.com/?q=Coworking+Space+Mataram",
    excerpt:
      "Dibatalkan karena jadwal pengajar bentrok — akan dijadwalkan ulang bulan depan.",
    description: `Acara ini dibatalkan: pengajar utama harus keluar kota.

Materi yang tadinya disiapkan (wiring Nginx, systemd, deploy otomatis lewat GitHub Action) akan dibawakan di kelas pengganti. Tanggal baru diumumkan lewat halaman Event.`,
  },
];

/**
 * Pembicara demo per event.
 *
 * Fotonya diambil dari `public/images/people/` — berkas di sana memang dinamai
 * sesuai orangnya (anto, dimas, …) plus `speaker1..10` untuk nama generik.
 * Nama + topik bebas: tidak ada FK ke `users`, jadi pembicara dari luar
 * komunitas pun bisa dicatat (lihat src/lib/db/schema.ts).
 */
const SPEAKERS = [
  {
    eventSlug: "workshop-nextjs-app-router",
    speakers: [
      {
        name: "Gilang Ramadhan",
        topic: "App Router & Server Component",
        photo: "/images/people/gilang.jpeg",
      },
      {
        name: "Fandi Ahmad",
        topic: "Server Action & form tanpa API route",
        photo: "/images/people/fandi.jpg",
      },
      {
        name: "Maulana Ibrahim",
        topic: "Deploy ke Vercel",
        photo: "/images/people/maulana.jpeg",
      },
    ],
  },
  {
    eventSlug: "workshop-flutter-pemula",
    speakers: [
      {
        name: "Anto Saputra",
        topic: "Dasar widget & layout",
        photo: "/images/people/anto.jpg",
      },
      {
        name: "Dimas Prasetyo",
        topic: "Menarik data dari API",
        photo: "/images/people/dimas.jpg",
      },
    ],
  },
  {
    eventSlug: "hackathon-lombok-2026",
    speakers: [
      {
        name: "Rina Kartika",
        topic: "Pembukaan & aturan penjurian",
        photo: "/images/people/speaker1.webp",
      },
      {
        name: "Bayu Setiawan",
        topic: "Mentoring produk",
        photo: "/images/people/speaker4.webp",
      },
      {
        name: "Sari Wulandari",
        topic: "Pariwisata berkelanjutan sebagai tema",
        photo: "/images/people/speaker7.webp",
      },
    ],
  },
  {
    eventSlug: "ngobrol-santai-framework-2026",
    speakers: [
      {
        name: "Yoga Pratama",
        topic: "Moderator diskusi",
        photo: "/images/people/speaker2.webp",
      },
    ],
  },
  {
    eventSlug: "sharing-sesi-karier-it",
    speakers: [
      {
        name: "Nadia Rahmawati",
        topic: "Portofolio yang dilirik rekruter",
        photo: "/images/people/speaker5.webp",
      },
      {
        name: "Reza Fahlevi",
        topic: "Kerja remote untuk perusahaan luar",
        photo: "/images/people/speaker9.webp",
      },
    ],
  },
];

/** Demo projects. Two stay `pending` so the admin moderation list has work. */
const PROJECTS = [
  {
    slug: "siwalan-kasir-warung",
    name: "SIWALAN — Kasir Warung Digital",
    status: "approved",
    githubUrl: "https://github.com/mataramdev/siwalan",
    demoUrl: "https://siwalan.mataramdev.id",
    stacks: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
    contributors: ["rifqi", "aldi"],
    content: `Aplikasi kasir sederhana untuk warung dan toko kelontong.

## Masalah

Pencatatan penjualan warung biasanya masih di buku tulis: stok tidak ketahuan, utang pelanggan sering lupa, dan laporan bulanan bikin pusing.

## Fitur

- Kasir cepat dengan pencarian nama barang
- Stok otomatis berkurang setiap transaksi
- Catatan utang ("bon") per pelanggan
- Laporan harian dan bulanan yang bisa dicetak
- Mode offline: transaksi disimpan dulu di perangkat

## Teknis

Dibangun dengan Next.js App Router dan PostgreSQL, sengaja tanpa layanan berbayar supaya biaya operasional tetap nol untuk warung kecil.`,
  },
  {
    slug: "lombok-trip-planner",
    name: "Lombok Trip Planner",
    status: "approved",
    githubUrl: "https://github.com/mataramdev/lombok-trip-planner",
    demoUrl: "https://trip.mataramdev.id",
    stacks: ["Flutter", "Supabase"],
    contributors: ["baiqnurul", "dinda"],
    content: `Aplikasi perencana perjalanan wisata di Lombok.

## Fitur

- Menyusun itinerary per hari (Gili, Senggigi, Sembalun, Kuta Mandalika)
- Estimasi biaya transportasi dan penginapan
- Simpan rencana dan bagikan ke teman satu rombongan
- Bekerja offline, sinkron saat kembali online

## Catatan desain

Tampilan dibuat sesederhana mungkin supaya tetap nyaman dipakai orang tua yang bukan pengguna teknologi sehari-hari.`,
  },
  {
    slug: "presensi-desa-digital",
    name: "Presensi Desa Digital",
    status: "approved",
    githubUrl: "https://github.com/mataramdev/presensi-desa",
    demoUrl: "https://presensi.mataramdev.id",
    stacks: ["Laravel", "PHP", "PostgreSQL"],
    contributors: ["zaki", "rifqi"],
    content: `Pencatatan kehadiran perangkat desa, dibuat setelah melihat proses manual di dua desa di Lombok Barat.

## Alur

1. Perangkat desa memindai kode QR di kantor
2. Sistem mencatat jam datang dan jam pulang
3. Kepala desa meninjau rekap bulanan
4. Rekap diekspor ke Excel untuk laporan ke kecamatan

## Teknis

Laravel + PostgreSQL, berjalan di VPS 1 GB dengan Nginx dan systemd. Semua halaman admin memakai otorisasi berbasis peran.`,
  },
  {
    slug: "kamus-bahasa-sasak",
    name: "Kamus Bahasa Sasak",
    status: "approved",
    githubUrl: "https://github.com/mataramdev/kamus-sasak",
    demoUrl: "https://kamus.mataramdev.id",
    stacks: ["Vue.js", "Node.js"],
    contributors: ["aldi", "dewi"],
    content: `Kamus Bahasa Sasak–Indonesia yang bisa dipakai tanpa koneksi internet.

## Isi

- Sekitar 4.200 lema hasil pengumpulan bersama anggota komunitas
- Pencarian cepat dengan pencocokan awalan
- Penanda tingkat tutur (*alus*, *madya*, *kasar*) pada setiap lema
- Halaman kontribusi untuk mengusulkan koreksi

## Rencana

Menambahkan contoh kalimat per lema dan rekaman audio dari penutur asli, dikerjakan bertahap oleh relawan komunitas.`,
  },
  {
    slug: "koperasiku",
    name: "KoperasiKU — Pencatatan Simpan Pinjam",
    status: "approved",
    githubUrl: "https://github.com/mataramdev/koperasiku",
    demoUrl: "https://koperasiku.mataramdev.id",
    stacks: ["React", "Node.js", "PostgreSQL"],
    contributors: ["rifqi", "zaki", "dinda"],
    content: `Pencatatan simpanan dan pinjaman anggota koperasi, ditargetkan untuk koperasi dengan 50–500 anggota.

## Fitur

- Buku simpanan per anggota (pokok, wajib, sukarela)
- Pengajuan pinjaman, persetujuan pengurus, dan jadwal angsuran
- Perhitungan jasa pinjaman dengan dua metode
- Laporan untuk rapat anggota tahunan

## Pelajaran

Bagian tersulit bukan kodenya, melainkan menyamakan istilah akuntansi koperasi dengan istilah yang dipakai pengurus harian.`,
  },
  {
    slug: "balecode-cli",
    name: "BaleCode CLI — Generator Struktur Proyek",
    status: "pending",
    githubUrl: "https://github.com/mataramdev/balecode",
    demoUrl: "",
    stacks: ["Go", "Docker"],
    contributors: ["zaki"],
    content: `CLI kecil untuk menyiapkan struktur proyek dari template komunitas.

- \`balecode new next-app\` menyiapkan Next.js + Tailwind + Supabase
- \`balecode new api-go\` membuat service Go dengan health check dan migration runner
- Template disimpan di repositori terpisah supaya bisa diperbarui tanpa rilis baru

Diajukan untuk masuk kurasi supaya bisa dipakai di workshop berikutnya.`,
  },
  {
    slug: "pantai-tracker",
    name: "Pantai Tracker — Info Ombak & Cuaca Pantai Lombok",
    status: "pending",
    githubUrl: "https://github.com/mataramdev/pantai-tracker",
    demoUrl: "",
    stacks: ["React Native", "Supabase"],
    contributors: ["baiqnurul", "aldi", "dinda"],
    content: `Aplikasi mobile yang menggabungkan prakiraan cuaca laut dengan kondisi pantai populer di Lombok.

## Ide

Peselancar dan nelayan butuh informasi tinggi gelombang per pantai, bukan prakiraan kota. Aplikasi ini menampilkan tinggi gelombang, arah angin, dan waktu pasang untuk setiap pantai, lengkap dengan foto kondisi terkini hasil unggahan pengguna.

## Status

Masih prototipe: peta dan daftar pantai sudah jalan, unggahan foto belum. Menunggu review admin sebelum tayang di halaman Proyek.`,
  },
];

/** Demo articles: every category is represented, plus tags for the filter. */
const POSTS = [
  {
    slug: "mulai-nextjs-16-app-router",
    title: "Mulai Next.js 16: App Router Tanpa Drama",
    category: "tutorial",
    tags: ["nextjs", "react", "pemula"],
    author: "aldi",
    publishedDaysAgo: 3,
    excerpt:
      "Kalau kamu baru pindah dari Pages Router, lima perubahan ini yang paling terasa.",
    content: `Pindah ke App Router terasa membingungkan di hari pertama. Setelah beberapa proyek, saya sadar perubahannya bisa disederhanakan jadi lima hal.

## 1. Folder adalah rute

Tidak ada lagi \`getServerSideProps\`. Setiap \`page.tsx\` adalah satu rute, dan \`layout.tsx\` membungkus semua halaman di bawahnya.

## 2. Komponen secara bawaan berjalan di server

Ini yang paling membingungkan di awal: \`console.log\` muncul di terminal, bukan di browser.

\`\`\`tsx
export default async function Page() {
  const res = await fetch("https://api.example.com/items");
  const items = await res.json();

  return <ul>{items.map((item) => <li key={item.id}>{item.name}</li>)}</ul>;
}
\`\`\`

Butuh state atau \`onClick\`? Tambahkan \`"use client"\` di atas file.

## 3. Server Action menggantikan sebagian API route

Form yang dulu butuh \`fetch\` + endpoint POST sekarang cukup memanggil fungsi di server.

## 4. \`useSearchParams\` harus dibungkus Suspense

Halaman yang membacanya wajib berada di dalam \`<Suspense>\`, kalau tidak build-nya gagal.

## 5. Mulailah dari yang kecil

Jangan refactor seluruh aplikasi dalam semalam. Ambil satu halaman, pindahkan, lalu rasakan bedanya.

Selamat mencoba — kalau buntu, bawa pertanyaannya ke kopdar.`,
  },
  {
    slug: "tips-debug-supabase-rls",
    title: "Tips Debug RLS Supabase yang Sering Bikin Pusing",
    category: "tips",
    tags: ["supabase", "postgresql", "security"],
    author: "rifqi",
    publishedDaysAgo: 9,
    excerpt:
      "Query kamu benar, tapi hasilnya kosong. Sembilan dari sepuluh kali penyebabnya RLS.",
    content: `RLS bekerja seperti yang seharusnya: diam. Query tidak error, ia hanya mengembalikan nol baris. Itu yang membuatnya sulit dilacak.

## Menguji sebagai pengguna nyata

Jangan menguji sebagai \`postgres\` — role itu melewati RLS. Uji dengan role aplikasi:

\`\`\`sql
set role authenticated;
set request.jwt.claims = '{"sub":"<user-uuid>"}';
select * from posts;
reset role;
\`\`\`

## Kebiasaan yang membantu

1. **Jalankan \`select * from pg_policies where tablename = 'posts';\`** dan baca ulang predikatnya, jangan hanya namanya.
2. **Tulis satu policy per operasi.** \`FOR ALL USING (...)\` sering bocor karena bagian \`WITH CHECK\`-nya lupa diisi.
3. **Ingat grant tabel.** RLS tidak berguna kalau role-nya memang belum punya \`SELECT\`. Dua lapis ini harus benar keduanya.
4. **Kolom sensitif bisa dicabut.** \`revoke select (email) on users from anon\` membuat \`select \\*\` dijawab error — dan itu memang tujuannya.

## Kesimpulan

RLS bukan penghalang; ia hanya tidak memberi tahu kenapa query-mu kosong. Biasakan menguji dengan role yang sama seperti pengguna, dan sebagian besar kebingungan ini hilang.`,
  },
  {
    slug: "cerita-kopdar-perdana-mataram-dev",
    title: "Cerita di Balik Kopdar Perdana Mataram Dev",
    category: "story",
    tags: ["komunitas", "kopdar"],
    author: "dinda",
    publishedDaysAgo: 20,
    excerpt:
      "Empat belas orang, satu piknik di Taman Kota, dan satu rencana yang akhirnya jalan.",
    content: `Sore itu cuacanya biasa saja — mendung, tapi tidak hujan. Kami kira cuma lima orang yang datang. Ternyata empat belas.

## Yang datang

Mahasiswa tingkat dua yang baru belajar HTML. Freelancer yang sudah lima tahun kerja sendiri dari kamar. Dua karyawan perusahaan yang mengurus jaringan. Satu orang yang mengaku "cuma penasaran".

Tidak ada yang memulai dengan perkenalan formal. Semua langsung duduk, buka laptop, dan saling tanya sedang mengerjakan apa.

## Yang kami catat

Sesi peta ide menghasilkan satu daftar panjang. Tiga yang paling sering muncul:

- Tempat bertanya yang ramah untuk pemula
- Kelas praktik, bukan seminar
- Proyek bareng supaya portofolio bisa tumbuh

Dari situ jadwal kopdar bulanan dan satu workshop per kuartal disusun.

## Untuk kalian yang belum datang

Tidak perlu jadi ahli. Justru yang belum tahu apa pun kami tunggu, karena pertanyaan merekalah yang membuat yang lain ikut belajar.

Sampai jumpa di kopdar berikutnya.`,
  },
  {
    slug: "flutter-vs-react-native-2026",
    title: "Flutter vs React Native di 2026: Pilih yang Mana?",
    category: "tutorial",
    tags: ["flutter", "react-native", "mobile"],
    author: "baiqnurul",
    publishedDaysAgo: 27,
    excerpt:
      "Jawaban jujurnya: tergantung. Tapi ada lima pertanyaan yang bisa mempersempit pilihan.",
    content: `Setiap kali pertanyaan ini muncul, jawabannya selalu "tergantung". Masalahnya, orang yang bertanya biasanya sudah tahu itu. Jadi mari kita pecah jadi pertanyaan yang lebih kecil.

## 1. Tim kamu menguasai JavaScript atau Dart?

Kalau tim sudah nyaman dengan React dan TypeScript, React Native memangkas waktu belajar secara signifikan.

## 2. Seberapa penting tampilan yang identik di tiap platform?

Flutter menggambar sendiri seluruh antarmukanya, jadi hasilnya paling konsisten.

## 3. Apakah butuh akses hardware yang tidak biasa?

Keduanya punya jembatan ke kode native, tapi kualitas paketnya berbeda-beda. Cek dulu paket spesifik yang kamu butuhkan.

## 4. Berapa ukuran aplikasinya?

Aplikasi Flutter minimal biasanya lebih besar karena membawa render engine-nya sendiri.

## 5. Apakah aplikasi akan lama dirawat?

Kalau ya, lihat kesehatan komunitas paket yang akan kamu pakai, bukan hanya framework-nya.

## Penutup

Keduanya cukup baik untuk 90% aplikasi. Yang menentukan adalah siapa yang akan merawat kode itu dua tahun lagi.`,
  },
  {
    slug: "checklist-deploy-ke-vps",
    title: "Checklist Deploy Aplikasi ke VPS",
    category: "tips",
    tags: ["devops", "docker", "vps"],
    author: "zaki",
    publishedDaysAgo: 35,
    excerpt:
      "Delapan barang yang wajib ada sebelum aplikasimu menyentuh VPS produksi.",
    content: `Deploy pertama biasanya berhasil. Yang bermasalah adalah deploy ke-50, saat tidak ada yang ingat apa saja yang sudah dipasang.

## Sebelum deploy

- [ ] Environment variable lengkap dan tidak ada yang di-commit
- [ ] Migrasi database bisa dijalankan berulang tanpa error
- [ ] Backup harian sudah dijadwalkan dan pernah diuji pulih
- [ ] Log keluar ke stdout, bisa dibaca dari \`journalctl\`

## Sesudah deploy

- [ ] Health check mengembalikan 200
- [ ] HTTPS aktif dan sertifikatnya diperbarui otomatis
- [ ] Firewall hanya membuka 80, 443, dan SSH
- [ ] Ada satu perintah untuk rollback ke rilis sebelumnya

## Satu tips kecil

Buat \`deploy.sh\` yang menjalankan semua langkah di atas secara berurutan. Skrip yang jelek tapi konsisten jauh lebih baik daripada urutan manual yang kamu hafal di kepala.`,
  },
  {
    slug: "belajar-sql-dari-data-nyata",
    title: "Belajar SQL dari Data Nyata, Bukan Tabel Contoh",
    category: "tutorial",
    tags: ["sql", "data", "python"],
    author: "dewi",
    publishedDaysAgo: 48,
    excerpt:
      "Data contoh selalu rapi. Data nyata penuh nilai kosong — dan di situlah belajarnya.",
    content: `Tutorial SQL selalu memakai tabel \`users\` yang rapi: setiap kolom terisi, tidak ada duplikat. Data sungguhan tidak seperti itu.

## Mulai dari pertanyaan, bukan dari tabel

Alih-alih bertanya "apa itu GROUP BY", coba jawab: berapa jumlah anggota baru tiap bulan? Pertanyaan itu memaksa kamu memakai \`date_trunc\` dan \`count\`.

\`\`\`sql
select date_trunc('month', created_at) as bulan, count(*) as jumlah
from users
group by 1
order by 1;
\`\`\`

## Biasakan memeriksa nilai kosong lebih dulu

Sebelum menghitung rata-rata, lihat berapa banyak baris yang NULL. Angka rata-rata dari 60% data yang terisi akan menyesatkan.

## Simpan query-mu

Tempel setiap query yang berhasil ke satu berkas, beri komentar satu baris tentang kenapa. Enam bulan lagi kamu akan berterima kasih pada diri sendiri.`,
  },
  {
    slug: "rangkuman-hackathon-lombok-2026",
    title: "Rangkuman Hackathon Lombok 2026",
    category: "event",
    tags: ["hackathon", "event"],
    author: "aldi",
    publishedDaysAgo: 2,
    excerpt:
      "Dua puluh tim, 48 jam, dan tiga ide yang paling siap dipakai pemangku kepentingan.",
    content: `Hackathon tahun ini selesai. Ini catatan cepatnya sambil menunggu rekaman sesi penjurian diunggah.

## Angka singkat

- 20 tim, 74 peserta
- 8 mentor bergiliran setiap 6 jam
- 3 pemenang, 2 hadiah khusus untuk tim pemula

## Tema yang paling sering diambil

Tim banyak memilih persoalan sampah di area wisata dan pencatatan kunjungan. Menariknya, dua tim memilih membangun alat untuk pemilik homestay, bukan untuk wisatawan.

## Pelajaran panitia

Jaringan internet di lokasi jadi titik lemah di hari pertama. Untuk tahun depan kami siapkan hotspot cadangan dan satu meja *offline kit*.

Terima kasih untuk semua tim yang menahan kantuk. Sampai ketemu di hackathon berikutnya.`,
  },
];

/** Demo downloads. `fileUrl` points at a small, stable public sample file. */
const SAMPLE_FILE =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const RESOURCES = [
  {
    name: "Cheatsheet Git & GitHub (PDF)",
    category: "doc",
    icon: "📘",
    fileUrl: SAMPLE_FILE,
    downloadCount: 128,
  },
  {
    name: "Starter Template Next.js + Tailwind",
    category: "code",
    icon: "🧱",
    fileUrl: SAMPLE_FILE,
    downloadCount: 96,
  },
  {
    name: "Design System Mataram Dev (Figma)",
    category: "design",
    icon: "🎨",
    fileUrl: SAMPLE_FILE,
    downloadCount: 61,
  },
  {
    name: "Rekaman Workshop Next.js App Router",
    category: "video",
    icon: "🎥",
    fileUrl: SAMPLE_FILE,
    downloadCount: 43,
  },
  {
    name: "Kumpulan Query SQL Siap Pakai",
    category: "doc",
    icon: "🗃️",
    fileUrl: SAMPLE_FILE,
    downloadCount: 22,
  },
];

const FAQ = [
  {
    question: "Apa itu Mataram Dev?",
    answer:
      "Komunitas developer dan designer di Mataram, Lombok. Kami rutin menggelar kopdar, workshop, dan sharing session — sekaligus mengerjakan proyek open source bareng. Semua kegiatan gratis.",
  },
  {
    question: "Saya masih pemula, boleh ikut?",
    answer:
      "Justru kami tunggu. Sebagian besar anggota memulai dari nol, dan kelas pemula jadi kegiatan yang paling sering kami buat. Tidak ada syarat kemampuan tertentu untuk bergabung.",
  },
  {
    question: "Apakah komunitas ini berbayar?",
    answer:
      "Tidak. Pendaftaran akun, mengikuti event, dan mengunduh resource semuanya gratis. Kalau ada kegiatan yang butuh biaya (misalnya sewa tempat), kami cari sponsor dulu supaya peserta tetap tidak dibebani.",
  },
  {
    question: "Bagaimana cara ikut event?",
    answer:
      "Buat akun, buka halaman Event, lalu pilih event yang mau diikuti dan tekan tombol RSVP. Konfirmasi akan tercatat, dan detail lokasi bisa dibuka lewat tautan peta di halaman event.",
  },
  {
    question: "Saya developer dari luar Lombok, masih boleh ikut?",
    answer:
      "Boleh. Sebagian kegiatan digelar online, dan halaman artikel serta Resource bisa diakses siapa saja tanpa harus tinggal di Mataram.",
  },
  {
    question: "Bagaimana cara menampilkan proyek saya di halaman Proyek?",
    answer:
      "Masuk ke dashboard, buka menu Proyek Saya, lalu ajukan proyek baru. Admin akan meninjau dulu (biasanya beberapa hari) sebelum proyek tayang di halaman publik.",
  },
];

/**
 * The admin profile is part of the demo surface too ("bio admin saja, tanpa
 * akun tambahan"), but it is only filled when empty: whatever the admin wrote
 * themselves must survive a re-run.
 */
const ADMIN_BIO = process.env.SEED_DUMMY_ADMIN_BIO ??
  "Pengelola Mataram Dev — suka mengajar, menulis catatan belajar, dan mengumpulkan orang untuk belajar bareng.";

const ACTIVITIES = [
  {
    name: "Workshop & Kelas Praktik",
    description:
      "Kelas langsung dengan laptop terbuka: Next.js, Flutter, Laravel, dan dasar-dasar web untuk pemula.",
    icon: "🛠️",
    color: "#3b82f6",
  },
  {
    name: "Sharing Session",
    description:
      "Cerita pengalaman dari anggota — karier, kerja remote, sampai pelajaran dari proyek yang gagal.",
    icon: "🎤",
    color: "#8b5cf6",
  },
  {
    name: "Kopdar Bulanan",
    description:
      "Pertemuan santai tiap bulan untuk ngobrol, tanya jawab, dan mengenal anggota baru.",
    icon: "☕",
    color: "#f59e0b",
  },
  {
    name: "Hackathon & Kompetisi",
    description:
      "Ajang mengerjakan ide dalam waktu terbatas, biasanya bertema persoalan nyata di Lombok.",
    icon: "🏆",
    color: "#ef4444",
  },
  {
    name: "Kolaborasi Open Source",
    description:
      "Proyek bareng yang dikerjakan anggota lintas keahlian, dari desain sampai deployment.",
    icon: "🧩",
    color: "#10b981",
  },
  {
    name: "Mentoring & Review Portofolio",
    description:
      "Sesi satu lawan satu untuk membahas CV, portofolio, dan langkah karier berikutnya.",
    icon: "🧭",
    color: "#06b6d4",
  },
];

// ─── Helpers ──────────────────────────────────────────────

const uid = () => randomUUID();

/** Dummy accounts all live on one domain, which keeps them easy to spot. */
const memberEmail = (username) => `${username}@${EMAIL_DOMAIN}`;

/** Keeps the RSVP rows declared on the event data in one place. */
function rsvpRowsFor(event, memberIds) {
  if (!event.rsvp) return [];

  const rows = [];
  for (const username of event.rsvp.going ?? []) {
    rows.push({ username, status: "going" });
  }
  for (const username of event.rsvp.cancelled ?? []) {
    rows.push({ username, status: "cancelled" });
  }

  return rows.filter((row) => memberIds.has(row.username));
}

// ─── Members ──────────────────────────────────────────────

/**
 * Creates a signable-in account (auth.users + auth.identities + public.users)
 * for one dummy member and returns its id.
 *
 * The same three-table dance as scripts/seed.mjs: GoTrue resolves an email
 * login through auth.identities, so an account without that row answers
 * "Invalid login credentials" even though the password is correct.
 */
async function upsertMember(member) {
  const email = memberEmail(member.username);

  const [existing] = await sql`
    select id from auth.users where email = ${email} limit 1
  `;
  const userId = existing?.id ?? uid();

  const appMetadata = { provider: "email", providers: ["email"] };
  const userMetadata = {
    sub: userId,
    email,
    fullname: member.fullname,
    email_verified: true,
    phone_verified: false,
  };

  if (existing) {
    await sql`
      update auth.users set
        encrypted_password = crypt(${MEMBER_PASSWORD}, gen_salt('bf')),
        email_confirmed_at = now(),
        updated_at = now(),
        raw_app_meta_data = ${sql.json(appMetadata)},
        raw_user_meta_data = ${sql.json(userMetadata)}
      where id = ${userId}
    `;
  } else {
    await sql`
      insert into auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data,
        confirmation_token, recovery_token, email_change, email_change_token_new,
        email_change_token_current, phone_change, phone_change_token,
        reauthentication_token
      ) values (
        ${userId}, '00000000-0000-0000-0000-000000000000', 'authenticated',
        'authenticated', ${email},
        crypt(${MEMBER_PASSWORD}, gen_salt('bf')),
        now(), now(), now(),
        ${sql.json(appMetadata)}, ${sql.json(userMetadata)},
        '', '', '', '', '', '', '', ''
      )
    `;
  }

  const [identity] = await sql`
    select id from auth.identities
    where provider = 'email' and provider_id = ${userId} limit 1
  `;
  const identityData = userMetadata;

  if (identity) {
    await sql`
      update auth.identities set
        identity_data = ${sql.json(identityData)},
        updated_at = now()
      where id = ${identity.id}
    `;
  } else {
    await sql`
      insert into auth.identities (
        id, provider_id, user_id, identity_data, provider,
        last_sign_in_at, created_at, updated_at
      ) values (
        ${uid()}, ${userId}, ${userId}, ${sql.json(identityData)}, 'email',
        now(), now(), now()
      )
    `;
  }

  // `username` is unique: a collision leaves it empty rather than aborting.
  const [taken] = await sql`
    select id from public.users
    where username = ${member.username} and id <> ${userId} limit 1
  `;
  if (taken) {
    log("peringatan", `username "${member.username}" sudah dipakai — dibiarkan kosong`);
  }

  const joinedAt = new Date(Date.now() - member.joinedDaysAgo * DAY);

  // The trigger on auth.users already inserted a minimal profile row; this
  // fills in the public fields. `role` stays `contributor`.
  await sql`
    insert into public.users (id, email, fullname, username, bio, role, created_at, updated_at)
    values (
      ${userId}, ${email}, ${member.fullname},
      ${taken ? null : member.username}, ${member.bio}, 'contributor',
      ${joinedAt}, now()
    )
    on conflict (id) do update set
      email = excluded.email,
      fullname = excluded.fullname,
      bio = excluded.bio,
      username = coalesce(excluded.username, public.users.username),
      created_at = excluded.created_at,
      updated_at = now()
  `;

  if (member.socials?.length) {
    for (const [platform, url] of member.socials) {
      // `social_links` has no unique key on (owner, platform), so match first.
      const [link] = await sql`
        select id from public.social_links
        where owner_type = 'user' and owner_id = ${userId} and platform = ${platform}
        limit 1
      `;

      if (link) {
        await sql`
          update public.social_links set url = ${url} where id = ${link.id}
        `;
      } else {
        await sql`
          insert into public.social_links (owner_type, owner_id, platform, url)
          values ('user', ${userId}, ${platform}, ${url})
        `;
      }
    }
  }

  return userId;
}

/** Username → user id, for the rows that reference members. */
async function seedMembers() {
  const byUsername = new Map();

  for (const member of MEMBERS) {
    const id = await upsertMember(member);
    byUsername.set(member.username, id);
  }

  log("anggota", `${byUsername.size} akun demo (bisa login)`);
  return byUsername;
}

// ─── Content ──────────────────────────────────────────────

/** The admin account is resolved at runtime: this script never creates one. */
async function resolveAdminId() {
  const preferredEmail = process.env.SEED_ADMIN_EMAIL;
  const rows = preferredEmail
    ? await sql`
        select id from public.users where email = ${preferredEmail} limit 1
      `
    : [];
  const [firstAdmin] = rows.length
    ? rows
    : await sql`
        select id from public.users where role = 'admin' order by created_at limit 1
      `;

  if (!firstAdmin) {
    throw new Error(
      "Tidak ada akun admin. Jalankan `pnpm db:seed` dulu untuk membuatnya.",
    );
  }

  return firstAdmin.id;
}

async function seedAdminProfile(adminId) {
  const [profile] = await sql`
    select bio from public.users where id = ${adminId}
  `;

  if (profile?.bio) {
    log("admin", "bio sudah ada — dibiarkan");
    return;
  }

  await sql`
    update public.users set bio = ${ADMIN_BIO}, updated_at = now()
    where id = ${adminId}
  `;
  log("admin", "bio profil admin diisi");
}

async function seedEvents(adminId, memberIds) {
  let rsvpCount = 0;
  let speakerCount = 0;

  const speakersBySlug = new Map(
    SPEAKERS.map((entry) => [entry.eventSlug, entry.speakers])
  );

  for (const event of EVENTS) {
    const [row] = await sql`
      insert into public.events (
        slug, title, excerpt, description, status,
        start_time, end_time, location_name, location_url, created_by
      ) values (
        ${event.slug}, ${event.title}, ${event.excerpt}, ${event.description},
        ${event.status}, ${event.startTime}, ${event.endTime},
        ${event.locationName}, ${event.locationUrl}, ${adminId}
      )
      on conflict (slug) do update set
        title = excluded.title,
        excerpt = excluded.excerpt,
        description = excluded.description,
        status = excluded.status,
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        location_name = excluded.location_name,
        location_url = excluded.location_url
      returning id
    `;

    for (const { username, status } of rsvpRowsFor(event, memberIds)) {
      await sql`
        insert into public.event_rsvp (event_id, user_id, status)
        values (${row.id}, ${memberIds.get(username)}, ${status})
        on conflict (event_id, user_id) do update set status = excluded.status
      `;
      rsvpCount += 1;
    }

    // Replace-all: seeder ini yang memiliki daftar pembicaranya.
    await sql`
      delete from public.event_speakers where event_id = ${row.id}
    `;

    for (const [index, speaker] of (speakersBySlug.get(event.slug) ?? []).entries()) {
      await sql`
        insert into public.event_speakers (event_id, name, topic, photo_url, "order")
        values (${row.id}, ${speaker.name}, ${speaker.topic}, ${speaker.photo}, ${index})
      `;
      speakerCount += 1;
    }
  }

  log("event", `${EVENTS.length} event, ${rsvpCount} RSVP, ${speakerCount} pembicara`);
}

async function seedProjects(memberIds) {
  // Stack rows are looked up by name; the ones missing from a database seeded
  // with SEED_SKIP_STACKS are created so the reference below never fails.
  const stackRows = await sql`select id, name from public.stacks`;
  const stackIds = new Map(stackRows.map((row) => [row.name, row.id]));

  for (const project of PROJECTS) {
    for (const name of project.stacks) {
      if (stackIds.has(name)) continue;

      const [created] = await sql`
        insert into public.stacks (name) values (${name})
        on conflict (name) do update set name = excluded.name
        returning id
      `;
      stackIds.set(name, created.id);
    }
  }

  for (const project of PROJECTS) {
    const contributorIds = project.contributors
      .map((username) => memberIds.get(username))
      .filter(Boolean);

    if (contributorIds.length === 0) {
      throw new Error(`Proyek "${project.slug}" tidak punya kontributor yang dikenal.`);
    }

    const [row] = await sql`
      insert into public.projects (
        slug, name, content, github_url, demo_url, status, created_by
      ) values (
        ${project.slug}, ${project.name}, ${project.content},
        ${project.githubUrl || null}, ${project.demoUrl || null},
        ${project.status}, ${contributorIds[0]}
      )
      on conflict (slug) do update set
        name = excluded.name,
        content = excluded.content,
        github_url = excluded.github_url,
        demo_url = excluded.demo_url,
        status = excluded.status,
        created_by = excluded.created_by
      returning id
    `;

    // Replace the two join tables wholesale: simpler and idempotent.
    await sql`
      delete from public.project_contributors where project_id = ${row.id}
    `;
    await sql`delete from public.project_stacks where project_id = ${row.id}`;

    for (const userId of contributorIds) {
      await sql`
        insert into public.project_contributors (project_id, user_id)
        values (${row.id}, ${userId})
        on conflict do nothing
      `;
    }

    for (const name of project.stacks) {
      await sql`
        insert into public.project_stacks (project_id, stack_id)
        values (${row.id}, ${stackIds.get(name)})
        on conflict do nothing
      `;
    }
  }

  const approved = PROJECTS.filter((p) => p.status === "approved").length;
  log(
    "proyek",
    `${PROJECTS.length} proyek (${approved} approved, ${PROJECTS.length - approved} pending)`,
  );
}

async function seedPosts(memberIds) {
  for (const post of POSTS) {
    const authorId = memberIds.get(post.author);
    if (!authorId) {
      throw new Error(`Artikel "${post.slug}" menunjuk penulis yang tidak dikenal.`);
    }

    await sql`
      insert into public.posts (
        slug, title, excerpt, content, category, tags,
        author_id, status, published_date
      ) values (
        ${post.slug}, ${post.title}, ${post.excerpt}, ${post.content},
        ${post.category}, ${post.tags}, ${authorId}, 'published',
        ${new Date(Date.now() - post.publishedDaysAgo * DAY)}
      )
      on conflict (slug) do update set
        title = excluded.title,
        excerpt = excluded.excerpt,
        content = excluded.content,
        category = excluded.category,
        tags = excluded.tags,
        author_id = excluded.author_id,
        status = excluded.status,
        published_date = excluded.published_date
    `;
  }

  log("artikel", `${POSTS.length} artikel terbit`);
}

async function seedResources() {
  for (const resource of RESOURCES) {
    const [existing] = await sql`
      select id from public.free_resources where name = ${resource.name} limit 1
    `;

    if (existing) {
      await sql`
        update public.free_resources set
          file_url = ${resource.fileUrl},
          icon = ${resource.icon},
          category = ${resource.category},
          download_count = ${resource.downloadCount}
        where id = ${existing.id}
      `;
    } else {
      await sql`
        insert into public.free_resources (name, file_url, icon, category, download_count)
        values (
          ${resource.name}, ${resource.fileUrl}, ${resource.icon},
          ${resource.category}, ${resource.downloadCount}
        )
      `;
    }
  }

  log("resource", `${RESOURCES.length} resource`);
}

async function seedFaq() {
  for (const [index, item] of FAQ.entries()) {
    const [existing] = await sql`
      select id from public.faq where question = ${item.question} limit 1
    `;

    if (existing) {
      await sql`
        update public.faq set answer = ${item.answer}, "order" = ${index + 1}
        where id = ${existing.id}
      `;
    } else {
      await sql`
        insert into public.faq (question, answer, "order")
        values (${item.question}, ${item.answer}, ${index + 1})
      `;
    }
  }

  log("faq", `${FAQ.length} pertanyaan`);
}

async function seedActivities() {
  for (const [index, item] of ACTIVITIES.entries()) {
    const [existing] = await sql`
      select id from public.activities where name = ${item.name} limit 1
    `;

    if (existing) {
      await sql`
        update public.activities set
          description = ${item.description},
          icon = ${item.icon},
          color = ${item.color},
          "order" = ${index + 1}
        where id = ${existing.id}
      `;
    } else {
      await sql`
        insert into public.activities (name, description, icon, color, "order")
        values (
          ${item.name}, ${item.description}, ${item.icon}, ${item.color},
          ${index + 1}
        )
      `;
    }
  }

  log("aktivitas", `${ACTIVITIES.length} aktivitas`);
}

/**
 * Only touches the singleton settings row when a field is still empty — the
 * admin's own wording (and the logo URLs) must survive a re-run.
 */
async function seedSettings() {
  const [settings] = await sql`
    select id, description, keywords, address, maps_location
    from public.community_settings limit 1
  `;

  if (!settings) {
    log("pengaturan", "dilewati — jalankan `pnpm db:seed` dulu");
    return;
  }

  const description =
    settings.description ||
    "Komunitas developer dan designer di Mataram, Lombok. Tempat belajar, berbagi, dan membangun proyek bareng — untuk pemula sampai yang sudah berpengalaman.";
  const keywords = settings.keywords?.length
    ? settings.keywords
    : ["mataram dev", "komunitas developer", "lombok", "ntb", "coding"];
  const address = settings.address || "Mataram, Lombok, Nusa Tenggara Barat";
  const mapsLocation =
    settings.maps_location ||
    "https://www.google.com/maps?q=Mataram%2C%20Lombok%2C%20NTB&output=embed";

  await sql`
    update public.community_settings set
      description = ${description},
      keywords = ${keywords},
      address = ${address},
      maps_location = ${mapsLocation}
    where id = ${settings.id}
  `;

  log("pengaturan", "deskripsi/alamat/peta diisi bila masih kosong");
}

// ─── Reset ────────────────────────────────────────────────

/** Removes every row this script creates, in FK-safe order. */
async function reset() {
  const eventSlugs = EVENTS.map((event) => event.slug);
  const projectSlugs = PROJECTS.map((project) => project.slug);
  const postSlugs = POSTS.map((post) => post.slug);
  const resourceNames = RESOURCES.map((resource) => resource.name);
  const questions = FAQ.map((item) => item.question);
  const activityNames = ACTIVITIES.map((item) => item.name);
  const emails = MEMBERS.map((member) => memberEmail(member.username));

  const removed = await sql`
    with gone_rsvp as (
      delete from public.event_rsvp
      where event_id in (select id from public.events where slug = any(${eventSlugs}))
      returning 1
    ), gone_speakers as (
      delete from public.event_speakers
      where event_id in (select id from public.events where slug = any(${eventSlugs}))
      returning 1
    ), gone_events as (
      delete from public.events where slug = any(${eventSlugs}) returning 1
    ), gone_contributors as (
      delete from public.project_contributors
      where project_id in (select id from public.projects where slug = any(${projectSlugs}))
      returning 1
    ), gone_stacks as (
      delete from public.project_stacks
      where project_id in (select id from public.projects where slug = any(${projectSlugs}))
      returning 1
    ), gone_projects as (
      delete from public.projects where slug = any(${projectSlugs}) returning 1
    ), gone_posts as (
      delete from public.posts where slug = any(${postSlugs}) returning 1
    ), gone_resources as (
      delete from public.free_resources where name = any(${resourceNames}) returning 1
    ), gone_faq as (
      delete from public.faq where question = any(${questions}) returning 1
    ), gone_activities as (
      delete from public.activities where name = any(${activityNames}) returning 1
    ), gone_links as (
      delete from public.social_links
      where owner_id in (select id from public.users where email = any(${emails}))
      returning 1
    ), gone_members as (
      delete from auth.users where email = any(${emails}) returning 1
    ), gone_admin_bio as (
      -- Only the bio this script wrote; an edited one is left alone.
      update public.users set bio = null where bio = ${ADMIN_BIO} returning 1
    )
    select
      (select count(*) from gone_events)     as events,
      (select count(*) from gone_rsvp)       as rsvp,
      (select count(*) from gone_speakers)   as speakers,
      (select count(*) from gone_projects)   as projects,
      (select count(*) from gone_contributors) + (select count(*) from gone_stacks) as project_links,
      (select count(*) from gone_posts)      as posts,
      (select count(*) from gone_resources)  as resources,
      (select count(*) from gone_faq)        as faq,
      (select count(*) from gone_activities) as activities,
      (select count(*) from gone_links)      as links,
      (select count(*) from gone_members)    as members,
      (select count(*) from gone_admin_bio)  as admin_bio
  `;

  const totals = removed[0];
  console.log("\nData demo dihapus:\n");
  log("anggota", `${totals.members} akun (auth + profil)`);
  log("konten", `${totals.events} event · ${totals.rsvp} RSVP · ${totals.speakers} pembicara · ${totals.projects} proyek · ${totals.project_links} relasi proyek`);
  log("konten", `${totals.posts} artikel · ${totals.resources} resource · ${totals.faq} FAQ · ${totals.activities} aktivitas`);
  log("tautan", `${totals.links} social link, ${totals.admin_bio} bio admin dikosongkan`);
  console.log("");
}

// ─── Run ──────────────────────────────────────────────────

try {
  await sql`create extension if not exists pgcrypto`;

  if (RESET) {
    console.log("\nMenghapus data demo…");
    await reset();
  } else {
    console.log("\nMengisi data demo…\n");

    // The admin is created by scripts/seed.mjs, not here.
    const adminId = await resolveAdminId();

    await seedSettings();
    await seedAdminProfile(adminId);
    const memberIds = await seedMembers();
    await seedEvents(adminId, memberIds);
    await seedProjects(memberIds);
    await seedPosts(memberIds);
    await seedResources();
    await seedFaq();
    await seedActivities();

    console.log("\nSelesai. Situs siap dilihat:\n");
    console.log("   Halaman   http://localhost:3000");
    for (const path of ["/event", "/proyek", "/artikel", "/resource", "/anggota", "/faq"]) {
      console.log(`             ${path}`);
    }
    console.log(`\n   Akun demo ${MEMBERS.length} buah, kata sandi semuanya: ${MEMBER_PASSWORD}`);
    console.log(`   Contoh    ${memberEmail(MEMBERS[0].username)}`);
    console.log(
      "\n   Gambar sengaja dikosongkan (butuh kredensial Storage untuk mengunggah)," +
        "\n   jadi setiap halaman memakai tampilan cadangannya.\n" +
        "\n   Hapus lagi dengan: pnpm db:seed:dummy --reset\n",
    );
  }
} catch (error) {
  console.error("\nGagal mengisi data demo:\n");
  console.error(`   ${error.message}\n`);
  process.exitCode = 1;
} finally {
  await sql.end();
}
