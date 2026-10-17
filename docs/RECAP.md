# 📋 RECAP - Mataram Dev Project Progress

**Terakhir diupdate:** 24 September 2026
**Status:** ✅ Semua task (Phase 1-4) + Phase 5 (RLS & kesiapan deploy) selesai dan terverifikasi terhadap Supabase asli. Sisa: keputusan auth + deploy Vercel.
**Phase Aktual:** —

---

## 📊 Ringkasan Eksekusi

| Metric | Status |
|--------|--------|
| Total Task (Phase 1-4) | 13 task |
| Selesai | **13 task** (1.1 - 1.4, 2.1 - 2.3, 3.1 - 3.3, 4.1 - 4.3) |
| Dikerjakan | 0 |
| Belum dikerjakan | 0 |
| Persentase | **100%** |
| Phase 5-6 (di luar roadmap) | ✅ RLS + bucket + kolom `created_by` (Phase 5) · isi `stacks` + verifikasi putaran kedua (Phase 6) |

---

## ✅ Phase 1: Foundation & Identity — SELESAI (4/4)

### Task 1.1: Auth Foundation ✅

**Goal:** Setup autentikasi email/password dan sinkronisasi user.

| Item | Status | Detail |
|------|--------|--------|
| Supabase Auth (Email/Password) | ✅ | Register, Login, Logout via Server Actions |
| Postgres Trigger | ✅ | `src/lib/db/trigger.sql` — sync `auth.users → public.users` |
| Login Page | ✅ | `src/app/(auth)/login/page.tsx` — form + `useActionState` |
| Register Page | ✅ | `src/app/(auth)/register/page.tsx` — fullname, email, password |
| Auth Layout | ✅ | `src/app/(auth)/layout.tsx` — centered form shell |
| Middleware Auth Guard | ✅ | `middleware.ts` — protect `/profil`, `/proyek-saya`, `/artikel-saya`, `/admin` |
| Zod Validation | ✅ | `src/lib/validations/auth.ts` — register & login schema |
| Env Guard | ✅ | `src/lib/env.ts` — `EnvError` + pesan fix; middleware balikin 503, bukan 500 opaque |

**File yang dibuat:**
- `src/lib/validations/auth.ts`
- `src/lib/actions/auth.ts`
- `src/app/(auth)/layout.tsx`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/lib/db/trigger.sql`
- `src/lib/db/schema.ts` (diupdate)
- `src/lib/env.ts` (diupdate)

---

### Task 1.2: User Profiles ✅

**Goal:** Halaman edit profil dan manajemen tautan sosial.

| Item | Status | Detail |
|------|--------|--------|
| Profile Edit Page | ✅ | `src/app/(dashboard)/profil/page.tsx` |
| Profile Form | ✅ | Fullname, username, bio (readonly: email) |
| Social Links CRUD | ✅ | Add/remove dengan platform selector (GitHub, LinkedIn, dll) |
| Zod Validation | ✅ | `src/lib/validations/profile.ts` |
| Server Actions | ✅ | `src/lib/actions/profile.ts` — updateProfile, addSocialLink, removeSocialLink |

**File yang dibuat:**
- `src/lib/validations/profile.ts`
- `src/lib/actions/profile.ts`
- `src/app/(dashboard)/layout.tsx`
- `src/app/(dashboard)/profil/page.tsx`
- `src/app/(dashboard)/profil/ProfileForm.tsx`
- `src/app/(dashboard)/profil/SocialLinksSection.tsx`

---

### Task 1.3: Core Layout & Theme ✅

**Goal:** Navigasi global, footer, dan dark/light mode.

| Item | Status | Detail |
|------|--------|--------|
| ThemeProvider | ✅ | `next-themes` dengan class strategy |
| Theme Toggle | ✅ | Sun/Moon icon button |
| Global Navbar | ✅ | Logo, Mega Menu (Komunitas), auth-aware (login/register vs profil) |
| Mobile Menu | ✅ | Responsive hamburger menu |
| Footer | ✅ | 4-column layout (Brand, Komunitas, Resources, Lainnya) |
| Root Layout | ✅ | ThemeProvider + Navbar + Footer |

**File yang dibuat:**
- `src/components/layout/ThemeProvider.tsx`
- `src/components/layout/ThemeToggle.tsx`
- `src/components/layout/Navbar.tsx`
- `src/components/layout/Footer.tsx`
- `src/app/layout.tsx` (diupdate)
- `src/app/globals.css` (diupdate)

---

### Task 1.4: Community Settings ✅

**Goal:** Pengaturan komunitas oleh admin, data ditampilkan di landing page.

| Item | Status | Detail |
|------|--------|--------|
| Admin Settings Page | ✅ | `src/app/admin/pengaturan/page.tsx` |
| Settings Form | ✅ | Name, description, keywords (SEO), address, maps embed URL |
| Server Action | ✅ | Upsert single-row `community_settings` |
| Landing Page | ✅ | Fetch & tampilkan nama, deskripsi, lokasi dari `community_settings` |

**File yang dibuat:**
- `src/lib/validations/community.ts`
- `src/lib/actions/community.ts`
- `src/app/admin/layout.tsx`
- `src/app/admin/pengaturan/page.tsx`
- `src/app/admin/pengaturan/CommunitySettingsForm.tsx`
- `src/app/(public)/page.tsx` (diupdate)

---

## ✅ Phase 2: Engagement & Events — SELESAI (3/3)

### Task 2.1: Event Management (Admin) ✅

**Goal:** CRUD event oleh admin dengan upload gambar.

| Item | Status | Detail |
|------|--------|--------|
| Event List (Admin) | ✅ | `src/app/admin/event/page.tsx` — list + status badge + delete |
| Create Event | ✅ | Form: title, excerpt, description, status, time, location, image |
| Edit Event | ✅ | Form pre-fill dari data existing |
| Delete Event | ✅ | Dengan konfirmasi |
| Image Upload | ✅ | Upload ke Supabase Storage `events/` bucket + preview |
| Slug Generation | ✅ | Auto-generate dari judul + random suffix |
| Zod Validation | ✅ | Validasi judul, waktu (startTime < endTime), dll |

**File yang dibuat:**
- `src/lib/utils.ts` (slugify, formatDate, formatDateTime)
- `src/lib/validations/event.ts`
- `src/lib/actions/events.ts`
- `src/app/admin/event/page.tsx`
- `src/app/admin/event/DeleteEventButton.tsx`
- `src/app/admin/event/EventForm.tsx`
- `src/app/admin/event/baru/page.tsx`
- `src/app/admin/event/[id]/edit/page.tsx`

---

### Task 2.2: Event Discovery (Public) ✅

**Goal:** Halaman publik untuk melihat event.

| Item | Status | Detail |
|------|--------|--------|
| Public Event List | ✅ | `src/app/(public)/event/page.tsx` — grid card + empty state |
| Status Filter | ✅ | Query param `?status=` (upcoming / ongoing / completed / cancelled) + tombol "Semua" |
| Event Detail | ✅ | `src/app/(public)/event/[slug]/page.tsx` — slug-based, `notFound()` kalau tidak ada |
| Shared Status Config | ✅ | `src/lib/eventStatus.ts` — label & warna badge dipakai admin + publik |
| Admin Route Move | ✅ | `(admin)/event` → `admin/event` supaya `/event` bisa dipakai publik |
| Error Handling | ✅ | `error.tsx` boundary di `/event` dan `/event/[slug]` — DB error → error boundary, data kosong → empty state / `notFound()` |

**File error handling:**
- `src/app/(public)/event/error.tsx` — "Gagal memuat data event" + tombol retry
- `src/app/(public)/event/[slug]/error.tsx` — "Gagal memuat detail event" + tombol retry + link kembali

**Catatan:** Admin sekarang di `/admin/*`. Sebelumnya `(admin)/event` menempati `/event` dan semua link internal `/admin/event*` 404.

---

### Task 2.3: RSVP System ✅

**Goal:** User bisa join/cancel event.

| Item | Status | Detail |
|------|--------|--------|
| RSVP Server Action | ✅ | `src/lib/actions/rsvp.ts` — toggleRsvp, getRsvpCount, getUserRsvpStatus |
| RSVP Button | ✅ | `src/app/(public)/event/[slug]/RSVPButton.tsx` — client component dengan `useActionState` |
| RSVP Count | ✅ | Ditampilkan di halaman detail ("X orang sudah daftar") |
| Conditional Display | ✅ | Hanya tampil untuk event upcoming/ongoing |
| User Status Check | ✅ | Cek apakah user sudah RSVP saat render server |

**File yang dibuat:**
- `src/lib/actions/rsvp.ts`
- `src/app/(public)/event/[slug]/RSVPButton.tsx`

---

## ✅ Phase 3: Contribution & Showcase — SELESAI (3/3)

### Task 3.1: Project Submission ✅

**Goal:** Form submit proyek dengan image upload dan stack selection.

| Item | Status | Detail |
|------|--------|--------|
| Project Form | ✅ | `src/components/ProjectForm.tsx` — client component dengan useActionState |
| Validation | ✅ | `src/lib/validations/project.ts` — name, content, githubUrl, demoUrl, stackIds |
| Server Action | ✅ | `src/lib/actions/projects.ts` — createProject, getStacks |
| Image Upload | ✅ | Upload ke Supabase Storage `projects/` + preview |
| Stack Selection | ✅ | Multi-select buttons, fetch dari `stacks` table |
| Auto Contributor | ✅ | User otomatis jadi contributor saat submit |
| Submission Page | ✅ | `src/app/(dashboard)/proyek/baru/page.tsx` |

**File yang dibuat/diupdate:**
- `src/lib/validations/project.ts` (diupdate)
- `src/lib/actions/projects.ts` (baru)
- `src/components/ProjectForm.tsx` (diupdate)
- `src/app/(dashboard)/proyek/baru/page.tsx` (baru)

---

### Task 3.2: Project Showcase ✅

**Goal:** Halaman publik untuk melihat proyek komunitas.

| Item | Status | Detail |
|------|--------|--------|
| Project Gallery | ✅ | `src/app/(public)/proyek/page.tsx` — grid card + stack filter |
| Stack Filter | ✅ | Query param `?stack=stackId` + tombol "Semua" |
| Project Detail | ✅ | `src/app/(public)/proyek/[slug]/page.tsx` — slug-based, status `approved` only |
| Contributors | ✅ | Daftar contributor dengan avatar + nama + username |
| Stack Badges | ✅ | Link ke filter gallery |
| External Links | ✅ | GitHub + Demo buttons |
| Error Handling | ✅ | `error.tsx` boundaries untuk list + detail |

**File yang dibuat:**
- `src/app/(public)/proyek/page.tsx`
- `src/app/(public)/proyek/[slug]/page.tsx`
- `src/app/(public)/proyek/error.tsx`
- `src/app/(public)/proyek/[slug]/error.tsx`

---

### Task 3.3: Moderation Flow ✅

**Goal:** Admin bisa approve/reject proyek yang disubmit.

| Item | Status | Detail |
|------|--------|--------|
| Moderation Queue | ✅ | `src/app/admin/proyek/page.tsx` — default tab "Menunggu Review" |
| Status Filter | ✅ | Query param `?status=pending\|approved\|rejected\|all` + jumlah per status |
| Approve / Reject | ✅ | `ModerationButtons.tsx` — approve, reject (dengan konfirmasi), kembalikan ke pending |
| Server Action | ✅ | `moderateProject(projectId, status)` di `src/lib/actions/projects.ts` |
| Admin Role Check | ✅ | Re-check `users.role` di server action (middleware hanya tahu ada/tidaknya sesi) |
| Shared Status Config | ✅ | `src/lib/projectStatus.ts` — label & warna badge |
| Admin Nav | ✅ | `AdminNav.tsx` — tab Event / Moderasi Proyek / Pengaturan + badge jumlah pending |
| Cache Revalidation | ✅ | `revalidatePath` untuk `/admin/proyek`, `/proyek`, dan `/proyek/[slug]` |
| Error Handling | ✅ | `src/app/admin/proyek/error.tsx` — "Gagal memuat daftar moderasi" + retry |

**File yang dibuat/diupdate:**
- `src/lib/projectStatus.ts` (baru)
- `src/lib/actions/projects.ts` (diupdate — tambah `moderateProject`)
- `src/app/admin/proyek/page.tsx` (baru)
- `src/app/admin/proyek/ModerationButtons.tsx` (baru)
- `src/app/admin/proyek/error.tsx` (baru)
- `src/app/admin/AdminNav.tsx` (baru)
- `src/app/admin/layout.tsx` (diupdate — tambah nav + hitung pending)

**Alur:** submit (`pending`) → muncul di queue admin → **Setujui** → tampil di `/proyek` publik. **Tolak** → tetap tersembunyi. **Kembalikan** → masuk queue lagi.

---

## ✅ Phase 4: Knowledge Base — SELESAI (3/3)

*Goal: Provide lasting value through resources and articles.*

| Task | Deskripsi | Status |
|------|-----------|--------|
| 4.1 | Article/Blog System — create (Markdown), list, detail | ✅ Selesai |
| 4.2 | Resource Center — admin upload `free_resources` + download center + filter kategori | ✅ Selesai |
| 4.3 | FAQ System — admin CRUD FAQ dengan ordering | ✅ Selesai |

### Task 4.1: Article/Blog System ✅

**Goal:** Contributor bisa menulis artikel, publik bisa membaca daftar + detail.

| Item | Status | Detail |
|------|--------|--------|
| Form Tulis Artikel | ✅ | `src/app/(dashboard)/artikel/baru/page.tsx` + `src/components/PostForm.tsx` |
| Markdown | ✅ | `react-markdown` + `remark-gfm` via `src/components/Markdown.tsx` |
| Draf / Publish | ✅ | Dua tombol submit (`status=draft` / `status=published`) |
| Upload Cover | ✅ | Supabase Storage bucket `posts/` (path `covers/`) + preview |
| Halaman Saya | ✅ | `src/app/(dashboard)/artikel-saya/page.tsx` — draf + terbit, filter, tombol **Terbitkan** |
| Daftar Publik | ✅ | `src/app/(public)/artikel/page.tsx` — hanya `status=published`, filter `?kategori=` |
| Detail Publik | ✅ | `src/app/(public)/artikel/[slug]/page.tsx` — Markdown + penulis + tanggal |
| Server Actions | ✅ | `src/lib/actions/posts.ts` — `createPost`, `publishPost` (cek kepemilikan) |
| Validasi | ✅ | `src/lib/validations/post.ts` — judul, excerpt, isi min 50 char, kategori, status |
| URL | ✅ | Slug otomatis (`generateUniqueSlug`), kategori tetap: tutorial/tips/event/story |
| Error Boundary | ✅ | `error.tsx` di `/artikel`, `/artikel/[slug]`, `/artikel-saya` |

**File yang dibuat:**
- `src/lib/postStatus.ts`
- `src/lib/validations/post.ts`
- `src/lib/actions/posts.ts`
- `src/components/Markdown.tsx`
- `src/components/PostForm.tsx`
- `src/app/(dashboard)/artikel/baru/page.tsx`
- `src/app/(dashboard)/artikel-saya/page.tsx`
- `src/app/(dashboard)/artikel-saya/PublishDraftButton.tsx`
- `src/app/(dashboard)/artikel-saya/error.tsx`
- `src/app/(public)/artikel/page.tsx`
- `src/app/(public)/artikel/error.tsx`
- `src/app/(public)/artikel/[slug]/page.tsx`
- `src/app/(public)/artikel/[slug]/error.tsx`
- `src/components/layout/Navbar.tsx` (diupdate — link Artikel Saya)
- `src/app/(dashboard)/profil/page.tsx` (diupdate — kartu Artikel Saya)

**Belum ada:** moderasi admin untuk artikel (lihat Gap di bawah) dan halaman edit artikel.

### Task 4.2: Resource Center ✅

**Goal:** Admin bisa mengunggah resource gratis, publik bisa mengunduhnya tanpa login.

| Item | Status | Detail |
|------|--------|--------|
| Upload Admin | ✅ | `src/app/admin/resource/ResourceForm.tsx` — nama, kategori, ikon opsional, file (maks 10MB) |
| Server Actions | ✅ | `src/lib/actions/resources.ts` — `createResource`, `deleteResource`, keduanya cek role admin di server |
| Storage | ✅ | Bucket `resources/` (path `files/`); nama file dibersihkan, upload di-rollback kalau insert gagal |
| Hapus | ✅ | Hapus baris DB dulu, lalu file di storage; konfirmasi di UI |
| Daftar Admin | ✅ | `src/app/admin/resource/page.tsx` — ikon, kategori, jumlah unduhan, total unduhan, ringkasan per kategori |
| Download Center | ✅ | `src/app/(public)/resource/page.tsx` — kartu resource + tombol Unduh, filter `?kategori=code\|doc\|design\|video` |
| Hitung Unduhan | ✅ | `src/app/(public)/resource/[id]/download/route.ts` — increment `download_count` lalu redirect 302 ke file |
| Validasi | ✅ | `src/lib/validations/resource.ts` — nama min 3 karakter, kategori dari enum, ikon opsional |
| Error Boundary | ✅ | `error.tsx` di `/resource` dan `/admin/resource` |
| Admin Nav | ✅ | Tab **Resource** di `AdminNav.tsx` |
| Bucket Kosong ≠ Error | ✅ | Query gagal → `throw` ke error boundary; 0 row → empty state. Route download juga bedakan 404 (resource tidak ada) dari 500 (DB gagal) |

**File yang dibuat:**
- `src/lib/resourceCategory.ts`
- `src/lib/storage.ts`
- `src/lib/validations/resource.ts`
- `src/lib/actions/resources.ts`
- `src/app/admin/resource/page.tsx`
- `src/app/admin/resource/ResourceForm.tsx`
- `src/app/admin/resource/ResourceRow.tsx`
- `src/app/admin/resource/error.tsx`
- `src/app/(public)/resource/page.tsx`
- `src/app/(public)/resource/error.tsx`
- `src/app/(public)/resource/[id]/download/route.ts`

**Diupdate:** `next.config.ts` (batas body Server Action 12MB), `src/app/admin/AdminNav.tsx` (tab Resource).

### Task 4.3: FAQ System ✅

**Goal:** Admin bisa mengelola FAQ beserta urutannya, publik bisa membacanya.

| Item | Status | Detail |
|------|--------|--------|
| CRUD Admin | ✅ | `src/app/admin/faq/page.tsx` — tambah, ubah inline, hapus |
| Pengaturan Urutan | ✅ | Tombol ▲▼ per baris; hanya muncul aktif kalau bukan baris paling atas/bawah |
| Logika Urutan | ✅ | `src/lib/faq.ts` — fungsi murni `sortFaqRows`, `faqOrderUpdates`, `moveFaqRow` |
| Server Actions | ✅ | `src/lib/actions/faq.ts` — `createFaq`, `updateFaq`, `deleteFaq`, `moveFaqItem` (semua cek role admin di server) |
| Halaman Publik | ✅ | `src/app/(public)/faq/page.tsx` — accordion `<details>` (tanpa JS client), bernomor 01, 02, 03 |
| Validasi | ✅ | `src/lib/validations/faq.ts` — pertanyaan 5-300 karakter, jawaban 5-5.000 karakter |
| Error Boundary | ✅ | `error.tsx` di `/faq` dan `/admin/faq` |
| Admin Nav | ✅ | Tab **FAQ** di `AdminNav.tsx` |
| Link Mati Diperbaiki | ✅ | `/faq` yang dirujuk dari quick link landing page + Footer tadinya 404 |

**File yang dibuat:**
- `src/lib/faq.ts`
- `src/lib/validations/faq.ts`
- `src/lib/actions/faq.ts`
- `src/app/admin/faq/page.tsx`
- `src/app/admin/faq/FaqForm.tsx`
- `src/app/admin/faq/FaqRow.tsx`
- `src/app/admin/faq/error.tsx`
- `src/app/(public)/faq/page.tsx`
- `src/app/(public)/faq/error.tsx`

**Diupdate:** `src/app/admin/AdminNav.tsx` (tab FAQ).

**Catatan urutan:** `faq.order` boleh `null` dan boleh sama, jadi urutannya tidak bisa diserahkan ke `ORDER BY` saja. Setiap kali urutan berubah, seluruh daftar dinomori ulang 0..n-1 dan **hanya baris yang berubah** yang ditulis — jadi tidak ada gap setelah hapus, tidak menimpa hasil edit, dan angka lama yang duplikat ikut diperbaiki. Baris baru di-insert dengan `order: null` (selalu di bawah), baru kemudian dinomori.

---

## 🗂️ Struktur File Project (saat ini)

```
mataram-dev/
├── middleware.ts                     ✅ Auth guard + env error 503
├── drizzle.config.ts                 ✅
├── .env.example                      ✅
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── CONVENTIONS.md
│   ├── PROGRESS.md
│   └── RECAP.md (ini)
└── src/
    ├── app/
    │   ├── layout.tsx                ✅ Root layout (Theme, Nav, Footer)
    │   ├── globals.css               ✅ Tailwind + dark mode
    │   ├── favicon.ico
    │   ├── (auth)/
    │   │   ├── layout.tsx            ✅ Auth layout
    │   │   ├── login/page.tsx        ✅ Login page
    │   │   └── register/page.tsx     ✅ Register page
    │   ├── (dashboard)/
    │   │   ├── layout.tsx            ✅ Auth guard
    │   │   ├── profil/
    │   │   │   ├── page.tsx          ✅ Profile edit page
    │   │   │   ├── ProfileForm.tsx   ✅ Profile form
    │   │   │   └── SocialLinksSection.tsx ✅ Social links
    │   │   ├── proyek/baru/page.tsx  ✅ Project submission
    │   │   ├── proyek-saya/
    │   │   │   ├── page.tsx          ✅ Status review proyek milik user + filter
    │   │   │   └── error.tsx         ✅ Error boundary
    │   │   ├── artikel/baru/page.tsx ✅ Tulis artikel (Markdown)
    │   │   └── artikel-saya/
    │   │       ├── page.tsx          ✅ Artikel saya + filter draf/terbit
    │   │       ├── PublishDraftButton.tsx ✅ Terbitkan draf
    │   │       └── error.tsx         ✅ Error boundary
    │   ├── (public)/
    │   │   ├── page.tsx              ✅ Landing page
    │   │   ├── event/
    │   │   │   ├── page.tsx          ✅ Event list + filter status
    │   │   │   ├── error.tsx         ✅ Error boundary (list)
    │   │   │   └── [slug]/
    │   │   │       ├── page.tsx      ✅ Event detail
    │   │   │       ├── RSVPButton.tsx ✅ Join/cancel event
    │   │   │       └── error.tsx     ✅ Error boundary (detail)
    │   │   ├── proyek/
    │   │   │   ├── page.tsx          ✅ Project gallery + stack filter
    │   │   │   ├── error.tsx         ✅ Error boundary (list)
    │   │   │   └── [slug]/
    │   │   │       ├── page.tsx      ✅ Project detail + contributors
    │   │   │       └── error.tsx     ✅ Error boundary (detail)
    │   │   ├── artikel/
    │   │   │   ├── page.tsx          ✅ Artikel list + filter kategori
    │   │   │   ├── error.tsx         ✅ Error boundary (list)
    │   │   │   └── [slug]/
    │   │   │       ├── page.tsx      ✅ Artikel detail (Markdown)
    │   │   │       └── error.tsx     ✅ Error boundary (detail)
    │   │   ├── resource/
    │   │   │   ├── page.tsx          ✅ Download center + filter kategori
    │   │   │   ├── error.tsx         ✅ Error boundary
    │   │   │   └── [id]/download/route.ts ✅ Hitung unduhan + redirect ke file
    │   │   └── faq/
    │   │       ├── page.tsx          ✅ FAQ publik (accordion, berurutan)
    │   │       └── error.tsx         ✅ Error boundary
    │   └── admin/                    ✅ Admin, URL /admin/*
    │       ├── layout.tsx            ✅ Role guard + admin nav
    │       ├── AdminNav.tsx          ✅ Tab nav + badge pending
    │       ├── event/
    │       │   ├── page.tsx          ✅ Event list (management)
    │       │   ├── DeleteEventButton.tsx ✅ Delete button
    │       │   ├── EventForm.tsx     ✅ Shared event form
    │       │   ├── baru/page.tsx     ✅ Create event
    │       │   └── [id]/edit/page.tsx ✅ Edit event
    │       ├── proyek/
    │       │   ├── page.tsx          ✅ Moderation queue + filter status
    │       │   ├── ModerationButtons.tsx ✅ Setujui / Tolak / Kembalikan
    │       │   └── error.tsx         ✅ Error boundary
    │       ├── stack/
    │       │   ├── page.tsx          ✅ Kelola stack + jumlah pemakaian
    │       │   ├── StackForm.tsx     ✅ Tambah stack
    │       │   ├── StackRow.tsx      ✅ Ganti nama / hapus
    │       │   └── error.tsx         ✅ Error boundary
    │       ├── resource/
    │       │   ├── page.tsx          ✅ Daftar resource + jumlah unduhan
    │       │   ├── ResourceForm.tsx  ✅ Unggah resource (file + ikon + kategori)
    │       │   ├── ResourceRow.tsx   ✅ Unduh / hapus
    │       │   └── error.tsx         ✅ Error boundary
    │       ├── faq/
    │       │   ├── page.tsx          ✅ Kelola FAQ + urutan
    │       │   ├── FaqForm.tsx       ✅ Tambah FAQ
    │       │   ├── FaqRow.tsx        ✅ Ubah / naik-turun / hapus
    │       │   └── error.tsx         ✅ Error boundary
    │       └── pengaturan/
    │           ├── page.tsx          ✅ Settings page
    │           └── CommunitySettingsForm.tsx ✅ Settings form
    ├── components/
    │   ├── layout/
    │   │   ├── ThemeProvider.tsx      ✅
    │   │   ├── ThemeToggle.tsx        ✅
    │   │   ├── Navbar.tsx             ✅
    │   │   └── Footer.tsx             ✅
    │   ├── ProjectForm.tsx            ✅ Project submission form
    │   ├── PostForm.tsx               ✅ Form tulis artikel
    │   ├── Markdown.tsx               ✅ Render Markdown artikel
    │   ├── ui/                        📭 Kosong
    │   ├── forms/                     📭 Kosong
    │   └── sections/                  📭 Kosong
    ├── lib/
    │   ├── supabase/
    │   │   ├── server.ts              ✅
    │   │   ├── client.ts              ✅
    │   │   └── middleware.ts          ✅
    │   ├── db/
    │   │   ├── schema.ts              ✅ 13 tabel + projects.created_by
    │   │   ├── index.ts               ✅ Drizzle client
    │   │   ├── trigger.sql            ✅ Auth trigger
    │   │   └── policies.sql           ✅ RLS + storage policies (idempoten)
    │   ├── validations/
    │   │   ├── auth.ts                ✅
    │   │   ├── profile.ts             ✅
    │   │   ├── event.ts               ✅
    │   │   ├── project.ts             ✅
    │   │   ├── stack.ts               ✅
    │   │   ├── post.ts                ✅
    │   │   ├── resource.ts            ✅
    │   │   ├── faq.ts                 ✅
    │   │   └── community.ts           ✅
    │   ├── actions/
    │   │   ├── auth.ts                ✅
    │   │   ├── profile.ts             ✅
    │   │   ├── events.ts              ✅
    │   │   ├── community.ts           ✅
    │   │   ├── rsvp.ts                ✅
    │   │   ├── projects.ts            ✅ (+ moderateProject)
    │   │   ├── stacks.ts              ✅ createStack, renameStack, deleteStack
    │   │   ├── posts.ts               ✅ createPost, publishPost
    │   │   ├── resources.ts           ✅ createResource, deleteResource
    │   │   └── faq.ts                 ✅ createFaq, updateFaq, deleteFaq, moveFaqItem
    │   ├── queries/                   📭 Kosong
    │   ├── utils.ts                   ✅ slugify, formatDate, formatDateTime
    │   ├── eventStatus.ts             ✅ Label & warna badge status event
    │   ├── projectStatus.ts           ✅ Label & warna badge status proyek
    │   ├── postStatus.ts              ✅ Label status + kategori artikel
    │   ├── resourceCategory.ts        ✅ Label, warna badge & ikon kategori resource
    │   ├── storage.ts                 ✅ Nama bucket, batas ukuran file, path dari URL storage
    │   ├── faq.ts                     ✅ Urutan FAQ (fungsi murni, bisa diuji tanpa DB)
    │   └── env.ts                     ✅ Guard env Supabase (EnvError)
    └── types/
        └── index.ts                   ✅ ActionResult<T>
```

---

## 🧰 Tech Stack yang Digunakan

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Framework | Next.js (App Router) | 16.3.5 |
| React | React | 19.2.8 |
| Styling | Tailwind CSS | 4.x |
| Database | Supabase (Postgres) | - |
| ORM | Drizzle ORM | 0.45.2 |
| Auth | Supabase Auth (@supabase/ssr) | 0.12.7 |
| Storage | Supabase Storage | - |
| Validation | Zod | 4.6.5 |
| Forms | React Hook Form + Zod resolver | 7.88.0 |
| Markdown | react-markdown + remark-gfm | 10.1.0 / 4.0.1 |
| Theme | next-themes | 0.4.6 |
| Hosting | Vercel | - |
| Package Manager | pnpm | 10.33.4 |

---

## 🔑 Keputusan Teknis

| Keputusan | Pilihan | Alasan |
|-----------|---------|--------|
| ORM | Drizzle ORM | Type-safety + migration yang jelas |
| Auth | Supabase Auth (Email/Password) | Satu ekosistem, OAuth ditunda ke v2 |
| Dark Mode | Class strategy (next-themes) | Toggle manual sesuai desain |
| Form Handling | Server Actions + useActionState | Next.js native, no extra API routes |
| Validation | Zod | Standard, integrasi mudah dengan TypeScript |
| DB Schema | 13 tabel + enum types | Sesuai ARCHITECTURE.md |
| URL Admin | `/admin/*` (folder `admin/` biasa) | Route group tidak menambah segment URL, jadi `(admin)/event` bentrok dengan `/event` publik |
| Guard Env | Satu sumber di `src/lib/env.ts` | Gagal dengan pesan jelas; middleware balikin 503 + langkah fix, bukan 500 opaque |
| Moderation | Default `pending` saat submit | Proyek baru tidak langsung tampil publik |
| Otorisasi Admin | Re-check role di server action | Middleware hanya tahu ada/tidaknya sesi, bukan role |
| Hapus Stack | Lepas `project_stacks` dulu, lalu hapus stack | FK tanpa cascade akan membuat delete gagal; konfirmasi UI menyebutkan jumlah proyek yang kehilangan tag |
| Error vs Kosong | Query error → `throw` ke `error.tsx`; 0 row → empty state / `notFound()` | DB mati tidak tampil sebagai "belum ada data" |
| Markdown Artikel | `react-markdown` + `remark-gfm` (HTML mentah tetap di-escape) | Tidak perlu bikin parser sendiri; `rehype-raw` tidak dipasang supaya `<script>` di isi artikel tidak dieksekusi |
| Publish Artikel | Penulis boleh langsung `published` (bisa juga simpan `draft`) | Enum `post_status` hanya punya `draft`/`published`; moderasi butuh status `pending` = migrasi enum, jadi ditunda |
| Bucket Artikel | Cover di bucket `posts/` (path `covers/`) | Konsisten dengan pemisahan `events/` dan `projects/` |
| Build | `.codegraph/` masuk `.gitignore` | Symlink tooling lokal bikin Turbopack panic saat memproses `globals.css` |
| Download Resource | Link publik lewat route handler `/resource/[id]/download`, bukan langsung ke URL storage | Storage-nya public, tapi hanya request yang lewat sini yang bisa dihitung; `download_count` di-increment di handler lalu redirect 302 ke file |
| Hitungan Unduhan | RPC `increment_download_count()` (SECURITY DEFINER) dipanggil route handler tanpa sesi; tetap best-effort — kalau RPC ditolak, file tetap terkirim dan error cuma di-log | anon sengaja TIDAK diberi UPDATE di `free_resources`, jadi counter tidak pernah jadi pintu tulis SQL publik — dan angka statistik tidak boleh bikin fitur unduh mati |
| Otorisasi Database | RLS lewat `src/lib/db/policies.sql` (idempoten): anon read-only, tulis hanya via `authenticated` + `is_admin()` / baris milik sendiri, `users.email` di-revoke kolom demi kolom | Anon key ada di bundle browser — tanpa RLS semua tabel (termasuk hapus `users`) terbuka penuh untuk siapa pun |
| Owner Proyek | Kolom `projects.created_by` (NOT NULL, FK → users) + policy SELECT/INSERT terikat pembuat | `createProject` membaca balik baris baru dengan `.select("id")`, dan baris `RETURNING` wajib lolos policy SELECT — tanpa kolom ini submit proyek selalu gagal. `WITH CHECK (created_by = auth.uid())` sekaligus menutup celah klaim kontribusi ke proyek pending orang lain |
| Batas Upload | `next.config.ts` → `experimental.serverActions.bodySizeLimit = "12mb"` | Default Server Action cuma 1MB, jadi file resource (ZIP/PDF) ditolak **sebelum** action-nya jalan. Ini juga memperbaiki upload event/proyek/artikel yang selama ini terbatas 1MB |
| Hapus Resource | Baris DB dulu, file storage kemudian (+ rollback upload kalau insert gagal) | Baris adalah sumber kebenaran; kegagalan storage tidak boleh menyisakan resource yang tidak bisa dihapus dari UI |

---

## ⚠️ Yang Perlu Dilakukan Sebelum Deploy

**Sudah dijalankan & terverifikasi** (signup asli, RLS diuji sebagai anon/member/admin, data tes sudah dibersihkan):

1. ✅ **`src/lib/db/trigger.sql`** — terbukti lewat signup sungguhan: `public.users` terisi otomatis oleh `on_auth_user_created` (role default `contributor`).
2. ✅ **`.env.local`** — terisi kredensial asli (Project URL + anon key + `DATABASE_URL` session pooler 5432).
3. ✅ **`pnpm db:push`** — 13 tabel + semua enum + kolom baru `projects.created_by`.
4. ✅ **Storage buckets**: `events`, `projects`, `posts`, `resources` (public; `avatars` tidak dibuat karena tidak ada kode yang memakainya).
5. ✅ **RLS**: `psql "$DATABASE_URL" -f src/lib/db/policies.sql` — 13/13 tabel aktif, 33 policy + 6 policy storage, anon read-only, `users.email` terkunci, semua route publik tetap 200 setelah kunci dipasang.

Tambahan dari putaran verifikasi kedua (24 September 2026):

6. ✅ **Tabel `stacks` terisi** — 18 stack awal masuk lewat jalur tulis yang sama dengan `/admin/stack` (admin → 201; member → 403, terbukti ditolak RLS). Tidak ada lagi alasan form submit proyek kosong.
7. ✅ **RSVP diuji penuh** — buat event (admin 201) → member RSVP `going` → hitungan publik anon = 1 → batalkan `cancelled` → hitungan 0 → daftar ulang. Angka itu benar-benar tampil di halaman publik: detail event merender "**1 orang sudah daftar**". Member lain yang mencoba mengubah RSVP orang: **0 baris** tersentuh.
8. ✅ **Tulis artikel diuji penuh** — draf tidak terlihat anon (0 baris) tapi terbaca pemiliknya, lalu `publishPost` menaikkan status → anon langsung melihatnya, dan artikel muncul di `/artikel`. Member lain tidak bisa menyunting artikel orang (0 baris).
9. ✅ **Urutan FAQ diuji dengan database sungguhan** — `src/lib/faq.ts` dites sebagai fungsi murni (9 pemeriksaan, lewat `node --experimental-strip-types`): null selalu terakhir, tie dipecah id, input tidak dimutasi, `faqOrderUpdates` hanya menulis baris yang berubah, `moveFaqRow` tidak error di ujung daftar dan memperbaiki angka duplikat. Lalu angka sengaja dirusak jadi `[5, 5, NULL]` di DB → dijalankan lewat fungsi app → jadi `0, 1, 2`; hapus baris tengah → tetap `0, 1` tanpa gap.
10. ✅ **CRUD admin diuji lewat jalur server action** — stack (tambah/ganti nama/hapus termasuk melepas `project_stacks` lebih dulu), event (edit + ganti status), FAQ (tambah/edit/hapus/urutan). Semua penolakan non-admin tercatat: member/anon 403–42501, atau 0 baris tersentuh.

**Masih perlu sebelum deploy beneran:**

1. **Putuskan "Confirm email"** di Supabase Auth → Sign In / Providers → Email. Sekarang **ON tanpa SMTP**, jadi pendaftar baru mendapat `email_not_confirmed` dan tidak bisa login (saat verifikasi tadi, akun test di-confirm manual via service role). Untuk tahap ini: matikan, atau pasang SMTP (Resend dsb.).
2. **Rotate `service_role` key** — key itu pernah ter-paste di chat.
3. **Vercel**: import fork `gper00/mataramdev-website` → production branch **`nextjs-app`**, root directory default, env cukup 2 (`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`), lalu set Site URL + redirect Supabase Auth ke domain Vercel.
   - PR #5 di-merge oleh maintainer ke branch **`nextjs-app`, bukan `main`** (`main` masih situs statis). Jadi deploy harus menunjuk branch itu; tayang di `main` nanti butuh satu PR `nextjs-app → main` lagi.
4. Catatan Vercel: `bodySizeLimit` 12MB tidak berlaku di serverless (batas ±4,5MB) — file resource besar perlu upload langsung ke storage (signed URL) kalau itu sudah wajib.
5. **PR #6** (`Kunci database dengan RLS + kolom projects.created_by`) masih OPEN menunggu review — itu yang membawa `policies.sql` ke repo.

---

## 📌 Langkah Berikutnya (bukan task roadmap)

Semua task Phase 1-4 sudah selesai, jadi yang tersisa adalah pekerjaan di luar roadmap:

1. ~~**Verifikasi end-to-end**~~ ✅ — RLS, submit proyek, moderasi, RSVP, tulis artikel, CRUD admin, upload, dan unduhan diuji dengan kredensial asli. Yang belum: klik form dari browser sungguhan (di mesin ini tidak ada browser) dan area yang belum punya UI sama sekali.
2. **Halaman publik yang masih 404** padahal sudah dirujuk Navbar/Footer: `/anggota` dan `/tentang`.
3. **Landing page belum lengkap** menurut PRD §3.1: event terbaru, featured projects, resource gratis, artikel, dan FAQ belum jadi section — sekarang masih quick links + peta.
4. **Artikel belum bisa diedit/dihapus**, dan moderasi artikel belum ada (butuh status `pending` di enum `post_status`).
5. **Semua gambar masih `<img>` biasa**, belum `next/image` + `remotePatterns` domain Supabase Storage.

---

## 🧪 Cakupan Verifikasi (terhadap Supabase asli)

Route dicek status HTTP-nya, dan mutasi database diuji langsung terhadap Supabase asli — **tanpa sesi browser** (di mesin ini tidak ada browser): panggilan dilewatkan ke PostgREST/storage API persis seperti yang dilakukan server action, memakai akun sungguhan (member non-admin dan admin). Halaman publik juga dirender sungguhan lewat `pnpm start` dengan data nyata:

| Area | Sudah dibuktikan | Belum dibuktikan |
|------|------------------|------------------|
| `/faq` publik | Render sungguhan dengan row asli (accordion bernomor 01/02/03), empty state, dan error saat backend mati — pakai stub PostgREST; urutan hasil renumber tampil benar | Klik tombol ▲▼ dari browser (logika + efek DB-nya sendiri sudah diuji) |
| FAQ admin | `createFaq` (insert `order: null` → dinomori di bawah), `updateFaq`, `deleteFaq` (+ renumber tanpa gap), `moveFaqItem` — semuanya dijalankan terhadap DB asli; angka rusak `[5, 5, NULL]` dibetulkan jadi `0, 1, 2`; fungsi murni `src/lib/faq.ts` lolos 9 pemeriksaan | Klik tombol dari browser |
| RSVP | Buat event (admin 201) → RSVP member `going` → hitungan anon 1 → `cancelled` → 0 → daftar ulang `going`; halaman detail merender "**1 orang sudah daftar**"; member lain 0 baris tersentuh; anon 401/42501; DELETE tidak punya policy → 0 baris | Klik tombol join dari browser |
| Artikel | Draf tidak terlihat anon (0 baris) tapi terbaca pemiliknya; `publishPost` → anon langsung melihatnya dan muncul di `/artikel`; member lain tidak bisa menyunting (0 baris) | Form `/artikel/baru` diklik dari browser; upload cover |
| Resource | Upload asli ke bucket `resources` (admin ✓, member ditolak ✓), `download_count` 0→2 lewat endpoint unduhan sungguhan, hapus file + baris ✓, 404 id palsu ✓ | Form `/admin/resource` diklik dari browser |
| Event / Proyek / Artikel | Submit proyek end-to-end (insert→contributor→stack link, 201 semua), flip moderasi pending→approved terlihat anon, admin buat/edit event, member ditolak semua (403/0 baris). Halaman event + artikel dirender dengan data nyata | Klik dari browser |
| Stack admin | Tambah, ganti nama, hapus — termasuk kasus stack yang sedang dipakai: lepas `project_stacks` dulu (204) lalu hapus stack (204), sisa `project_stacks` = 0 | Klik dari browser |
| Register / Login | Signup asli → trigger mengisi `public.users` (role `contributor`), email dikonfirmasi, login dapat token; halaman `(auth)` 200 | Klik login/register dari browser (cookie sesi Next) |

## ⚠️ Gap yang Diketahui (bukan bagian task manapun)

- ✅ **Selesai** — halaman **Proyek Saya** (`/proyek-saya`) menampilkan status review tiap submission (pending/approved/rejected) + filter; `createProject` sekarang redirect ke `/proyek-saya?submitted=1` dengan banner sukses, bukan ke galeri publik yang belum memuat proyek pending. Link masuk tersedia di Navbar (desktop + mobile) dan di halaman Profil.
- ✅ **Selesai** — admin CRUD stack di `/admin/stack`: tambah, ganti nama, hapus, plus jumlah proyek yang memakai tiap stack. Tabel `stacks` tidak perlu di-seed manual lagi.
- **`/anggota` dan `/tentang` belum ada** tapi sudah dirujuk dari Navbar (mega menu + link "Tentang") dan Footer → masih 404.
- Semua halaman masih `<img>` biasa, bukan `next/image` (`next.config.ts` belum ada `remotePatterns` untuk domain Supabase Storage).
- **Landing page belum punya section konten** seperti yang diminta PRD §3.1 (event terbaru, featured projects, resource, artikel, FAQ) — barunya quick links ke halaman masing-masing.
- **Moderasi artikel belum ada.** PRD §4.5 minta admin memoderasi sebelum publish, tapi enum `post_status` cuma punya `draft`/`published` — tidak ada state `pending`. Jadi untuk sekarang penulis bisa langsung publish. Perlu migrasi enum + queue moderasi (mirip `/admin/proyek`) kalau mau sesuai PRD.
- **Belum ada edit/hapus artikel.** Artikel yang sudah terbit hanya bisa dibaca; draf bisa diterbitkan lewat `/artikel-saya` tapi isinya tidak bisa diubah lagi dari UI.
- **`pnpm lint` rusak:** script-nya masih `next lint`, dan perintah itu sudah dihapus di Next 16 (`Invalid project directory provided: .../lint`). Sementara jalankan `npx eslint <path>`. Belum diubah karena di luar scope task.
