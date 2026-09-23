# PROJECT PROGRESS - Mataram Dev

**Status:** 🏗️ In Progress
**Current Phase:** Phase 4 - Knowledge Base

---

## 🗺️ Roadmap & Task Breakdown

### Phase 1: Foundation & Identity ✅
*Goal: Establish the identity of the platform, user authentication, and the basic shell.*

- [x] **Task 1.1: Auth Foundation** ✅
    - Setup Supabase Auth (Email/Password).
    - Implement Postgres Trigger for `auth.users` $\rightarrow$ `public.users` synchronization (`src/lib/db/trigger.sql`).
    - Create Login and Register pages in `(auth)/`.
    - Updated Drizzle schema with full `users` table + all core entities.
    - Auth server actions (register, login, logout) with Zod validation.
    - Middleware with protected route redirects.
- [x] **Task 1.2: User Profiles** ✅
    - Profile edit page in `(dashboard)/profil` with form (fullname, username, bio).
    - Social links management (add/remove) with platform selector.
- [x] **Task 1.3: Core Layout & Theme** ✅
    - Global Navigation with Komunitas Mega Menu + mobile menu.
    - Footer with nav links.
    - Light/Dark mode toggle (class strategy via next-themes).
    - Root Layout with ThemeProvider, Navbar (auth-aware), Footer.
- [x] **Task 1.4: Community Settings** ✅
    - Admin page at `(admin)/pengaturan` with form (name, description, keywords, address, maps).
    - Landing Page fetches data from `community_settings` (dynamic name, description, map embed).

### Phase 2: Engagement & Events
*Goal: Enable the community to discover and join activities.*

- [x] **Task 2.1: Event Management (Admin)** ✅
    - Admin CRUD for `events` (list, create, edit, delete).
    - Image upload to Supabase Storage (`events/` bucket) with preview.
    - Shared EventForm component with validation.
- [x] **Task 2.2: Event Discovery (Public)** ✅
    - Public Event List at `(public)/event/page.tsx` with status filters (`?status=upcoming|ongoing|completed|cancelled`).
    - Event Detail at `(public)/event/[slug]/page.tsx` with slug-based routing + `notFound()` fallback.
    - Shared status labels & badge colours in `src/lib/eventStatus.ts` (reused by the admin list).
    - Admin routes moved to `/admin/*` (`src/app/admin/`) so the public list can own `/event`.
    - **Error handling**: `error.tsx` boundaries at `/event` and `/event/[slug]` with user-friendly Indonesian messages + retry. DB errors → error boundary (500), genuine missing data → empty state / `notFound()`. No more catch-and-hide pattern.
- [x] **Task 2.3: RSVP System** ✅
    - RSVP toggle (join/cancel) via server action `toggleRsvp()`.
    - RSVP button component (`RSVPButton.tsx`) with `useActionState` for optimistic UI.
    - RSVP count display on event detail page.
    - Only shows RSVP for upcoming/ongoing events (not completed/cancelled).
    - Server-side data fetching: RSVP count + user status.

### Phase 3: Contribution & Showcase
*Goal: Create a collective portfolio of local digital talent.*

- [x] **Task 3.1: Project Submission** ✅
    - Submission form with Zod validation (name, content, githubUrl, demoUrl, image, stacks).
    - Project image upload to Supabase Storage (`projects/` bucket) with preview.
    - Stack selection from `stacks` table (multi-select buttons).
    - Auto-add current user as project contributor.
    - Page at `(dashboard)/proyek/baru/page.tsx`.
- [x] **Task 3.2: Project Showcase** ✅
    - Public Project Gallery at `(public)/proyek/page.tsx` with stack filtering (`?stack=stackId`).
    - Project Detail at `(public)/proyek/[slug]/page.tsx` with contributors, stacks, links.
    - Error boundaries for both pages with user-friendly messages + retry.
- [x] **Task 3.3: Moderation Flow** ✅
    - Admin moderation queue at `admin/proyek` with status filters (`?status=pending|approved|rejected|all`) and per-status counts.
    - Approve / Reject / return-to-pending via the `moderateProject()` server action (re-checks the admin role server-side; middleware only knows whether a session exists).
    - Shared status labels & badge colours in `src/lib/projectStatus.ts`.
    - Admin nav bar (`AdminNav.tsx`) with a badge for the number of pending submissions.
    - `error.tsx` boundary so a failing query shows a retry UI instead of an empty queue.

### Phase 4: Knowledge Base
*Goal: Provide lasting value through resources and articles.*

- [x] **Task 4.1: Article/Blog System** ✅
    - Content creation with Markdown (`src/components/PostForm.tsx`, saved as `draft` or `published`).
    - Markdown rendering via `react-markdown` + `remark-gfm` (`src/components/Markdown.tsx`); raw HTML stays escaped, so article bodies cannot inject scripts.
    - Article listing at `(public)/artikel/page.tsx` with category filters (`?kategori=tutorial|tips|event|story`), published-only.
    - Article detail at `(public)/artikel/[slug]/page.tsx` with author, cover, and published date.
    - Author's own list at `(dashboard)/artikel-saya` (drafts + published) with a **Terbitkan** action, plus the create page at `(dashboard)/artikel/baru`.
    - Shared status/category labels in `src/lib/postStatus.ts`; cover uploads go to the Supabase Storage `posts/` bucket.
    - `error.tsx` boundaries at `/artikel`, `/artikel/[slug]`, and `/artikel-saya`.
    - **Author publishes directly** — the `post_status` enum has no `pending`, so admin moderation of articles is not possible yet (see docs/RECAP.md gaps).
- [x] **Task 4.2: Resource Center** ✅
    - Admin upload at `/admin/resource` (`ResourceForm.tsx`): name, category, optional emoji icon, and the file itself (max 10MB) — stored in the Supabase Storage `resources/` bucket under `files/`.
    - Public download center at `(public)/resource/page.tsx` with category filters (`?kategori=code|doc|design|video`).
    - Downloads go through the route handler `(public)/resource/[id]/download/route.ts`, which increments `download_count` and redirects to the file. Counting is best-effort so a rejected update cannot block a download.
    - Delete removes the database row first and the stored file second; a failed insert rolls the upload back so the bucket does not collect unreachable files.
    - Shared category labels/colours/icons in `src/lib/resourceCategory.ts`; bucket name, size cap and the storage-URL-to-path helper live in `src/lib/storage.ts`.
    - `next.config.ts` now sets `serverActions.bodySizeLimit` to 12MB — the 1MB default rejected every upload in this project before the action ran.
    - `error.tsx` boundaries at `/resource` and `/admin/resource`.
- [x] **Task 4.3: FAQ System** ✅
    - Admin CRUD at `/admin/faq` (`FaqForm.tsx` + `FaqRow.tsx`): add, inline edit, delete, and reorder with ▲▼ buttons.
    - Public page at `(public)/faq/page.tsx` — ordered accordion built from native `<details>`, so it works without client JS and is keyboard/screen-reader accessible.
    - Ordering rules live in `src/lib/faq.ts` as pure functions (`sortFaqRows`, `faqOrderUpdates`, `moveFaqRow`) and are shared by the admin list, the public page, and the move action — if they disagreed, the ▲▼ buttons would move the wrong row.
    - `faq.order` is nullable and may repeat, so moves renumber the whole list (0, 1, 2, …) and only write rows whose number actually changes; a new entry is inserted with `order: null` (sorts last) and then numbered, so it lands at the bottom instead of on top.
    - Editing text never touches `order`; `error.tsx` boundaries at `/faq` and `/admin/faq`.
    - The `/faq` links in the landing page quick links and the Footer (previously 404) now resolve.

---

- [x] **Phase 5: Security & Deploy Setup (Supabase asli)** ✅
    - `src/lib/db/policies.sql` (idempoten): RLS aktif di 13/13 tabel — 33 policy tabel + 6 policy storage. Anon read-only (grant tulis dicabut + `ALTER DEFAULT PRIVILEGES` supaya tabel baru tidak ikut terbuka), `users.email` di-revoke kolom demi kolom, `role` tidak bisa di-update via REST (anti self-promotion), tulis konten publik hanya lewat `authenticated` + `is_admin()` / baris milik sendiri.
    - 4 bucket storage public (`events`, `projects`, `posts`, `resources`) dengan policy tulis terikat role + path, meniru path upload di server action masing-masing.
    - Kolom baru `projects.created_by` (NOT NULL, FK → users): `createProject` membaca balik barisnya dengan `.select("id")` dan baris `RETURNING` wajib lolos policy SELECT — tanpa kolom ini submit proyek selalu gagal di bawah RLS. `WITH CHECK (created_by = auth.uid())` sekaligus menutup celah kontributor masuk ke proyek pending orang lain.
    - Penghitung unduhan pindah ke RPC `increment_download_count()` (SECURITY DEFINER) karena anon memang tidak diberi UPDATE di `free_resources`.
    - Diuji langsung terhadap database asli: signup → trigger terisi, penolakan anon/member (events, stacks, kolom email, proyek asing), rantai submit proyek→contributor→stack, flip moderasi pending→approved terlihat anon, upload/ditolak di storage, unduhan 302 dengan counter 0→2, smoke semua route. Data tes sudah dibersihkan; akun admin pertama sudah ada.
- **Auth**: Focusing on urgent needs first (Email/Password), ignoring non-urgent OAuth for now.
- **ORM**: Drizzle ORM is the final choice for type-safety and migrations.
- **Styling**: Tailwind CSS 4.x with a focus on Bento Grid layouts.
- **Articles**: Written in Markdown and rendered server-side by `src/components/Markdown.tsx`. Authors can save drafts; drafts are only visible at `/artikel-saya`. Publishing does not go through admin review yet because `post_status` only has `draft`/`published`.
- **FAQ**: `faq.order` is nullable and can repeat, so the display order is computed by `sortFaqRows()` (ascending, rows without a number last, ties by id) rather than by SQL alone. Reordering renumbers the whole list and writes only the rows that move, which keeps the sequence gap-free after deletes and repairs duplicated/stale numbers. Text edits never change `order`.
- **Resources**: Admin uploads land in the Supabase Storage `resources/` bucket; the row stores the public URL in `file_url`. Deletion removes the row first and the storage object second, so a storage failure cannot leave an undeletable entry in the admin list. The `download_count` increment runs unauthenticated (downloads are public per PRD §4.4) through the RPC `increment_download_count()` (SECURITY DEFINER) and is best-effort — anon deliberately holds no UPDATE on `free_resources`, so the RPC is the only path that moves the counter; a rejected call is logged and the file still downloads.
- **Upload size**: `experimental.serverActions.bodySizeLimit = "12mb"` in `next.config.ts`. The framework default is 1MB, which silently rejects larger uploads before the action runs; keep this above `RESOURCE_MAX_FILE_MB` in `src/lib/storage.ts`.
- **Stacks**: The `stacks` table is managed from the admin UI at `/admin/stack` (add / rename / delete + usage counts). The project submission form reads from it, so no manual seeding is required. Deleting a stack detaches it from `project_stacks` first (the FK has no cascade).
- **Admin URL**: Admin pages live under `/admin/*` using a plain `src/app/admin/` folder, **not** the `(admin)` route group. Route groups don't add a URL segment, so `(admin)/event` would collide with the public `/event` route. This also makes the existing `/admin/event*` links and `redirect("/admin/event")` in the event actions resolve correctly, and lets middleware guard `/admin` for real.
