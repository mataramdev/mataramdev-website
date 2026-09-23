-- ============================================================
-- RLS + Storage policies — Mataram Dev website
--
-- Run order (once per project):
--   1. pnpm db:push                     (creates tables — src/lib/db/schema.ts)
--   2. psql "$DATABASE_URL" -f src/lib/db/trigger.sql
--   3. psql "$DATABASE_URL" -f src/lib/db/policies.sql   (this file)
--
-- Idempotent: safe to re-run. NOTE: tables created by a LATER db:push
-- still need their own `ENABLE ROW LEVEL SECURITY` + policies — only the
-- anon write-grants below carry over automatically (see step 1).
--
-- Design notes — every rule here mirrors an actual code path:
-- * Supabase's default privileges hand anon FULL write access (SELECT,
--   INSERT, UPDATE, DELETE, TRUNCATE) on every new table, and the anon
--   key ships in the browser bundle. Step 1 closes that first.
-- * anon may only read. Writes go through `authenticated`, narrowed by
--   RLS to "your own rows" or "you are an admin" (public.is_admin()).
-- * public.users.email is revoked from BOTH API roles. The profile page
--   takes the email from the auth session (user.email), never from this
--   table — see (dashboard)/profil/page.tsx.
-- * The public download counter is an RPC (increment_download_count,
--   SECURITY DEFINER) instead of an anon UPDATE, so a visitor can never
--   write an arbitrary value into free_resources.
-- * INSERT on public.users stays trigger-only (handle_new_user in
--   trigger.sql runs as the table owner and bypasses RLS). There is no
--   DELETE policy anywhere for users — the app has no user-deletion flow.
-- ============================================================


-- ─── Helper: is the current session an admin? ─────────────
-- SECURITY DEFINER so the check cannot be blocked by the caller's own
-- RLS view of public.users. Owner = postgres (table owner).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT u.role = 'admin' FROM users u WHERE u.id = auth.uid()),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;


-- ─── Helper: atomic download counter ──────────────────────
-- Called by (public)/resource/[id]/download/route.ts for every download.
-- SECURITY DEFINER because anon holds no UPDATE on the table.
CREATE OR REPLACE FUNCTION public.increment_download_count(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.free_resources
  SET download_count = download_count + 1
  WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_download_count(uuid) TO anon, authenticated;


-- ─── 1. Table privileges ──────────────────────────────────

-- anon: read-only, no exceptions.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- authenticated keeps the Supabase default (ALL) — the policies in step 2
-- narrow it down. TRUNCATE is an owner-level foot-gun nothing in the app needs.
REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM authenticated;

-- users: full email lockdown for both API roles, and profile columns are
-- the only ones an authenticated user may UPDATE — `role` is not one of
-- them, so a compromised session cannot promote itself via REST.
REVOKE ALL ON public.users FROM anon, authenticated;
GRANT SELECT (id, fullname, username, role, image_url, bio, created_at, updated_at)
  ON public.users TO anon, authenticated;
GRANT UPDATE (fullname, username, bio, image_url, updated_at)
  ON public.users TO authenticated;
-- If schema.ts later adds a users column, grant it here explicitly or
-- PostgREST will answer 42501 (permission denied) — that is intentional.

-- free_resources: no direct writes at all; the counter only moves through
-- increment_download_count() above.
REVOKE UPDATE ON public.free_resources FROM anon, authenticated;

-- Future tables created by drizzle-kit push (same role: postgres) must not
-- silently hand anon write access again. Reads stay open (public content),
-- but every NEW table still needs `ENABLE ROW LEVEL SECURITY` + policies
-- appended to this file — the revoke above does not travel to them.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;


-- ─── 2. Row Level Security ────────────────────────────────
-- ENABLE without FORCE: the table owner (postgres) keeps unrestricted
-- access for migrations, triggers and seeding — same pattern trigger.sql
-- relies on.

-- users ──────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_read ON public.users;
DROP POLICY IF EXISTS users_update_own ON public.users;
-- Public profiles (author bylines, contributor lists). email is already
-- column-revoked above, so this exposes no addresses.
CREATE POLICY users_read ON public.users
  FOR SELECT USING (true);
-- Own row only. WITH CHECK keeps id pinned to the caller, so a row cannot
-- be repointed at another user.
CREATE POLICY users_update_own ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
-- INSERT: trigger-only. DELETE: no policy (no code path).

-- posts ──────────────────────────────────────────────────
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS posts_read ON public.posts;
DROP POLICY IF EXISTS posts_insert_own ON public.posts;
DROP POLICY IF EXISTS posts_update_own ON public.posts;
-- Public sees published only; authors additionally see their own drafts
-- (dashboard/artikel-saya). auth.uid() is NULL for anon → published only.
CREATE POLICY posts_read ON public.posts
  FOR SELECT USING (status = 'published' OR author_id = auth.uid());
CREATE POLICY posts_update_own ON public.posts
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());
CREATE POLICY posts_insert_own ON public.posts
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

-- projects ───────────────────────────────────────────────
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS projects_read ON public.projects;
DROP POLICY IF EXISTS projects_insert_pending ON public.projects;
DROP POLICY IF EXISTS projects_moderate ON public.projects;
-- Public sees approved; admins see the moderation queue; the submitter sees
-- their own submission at any stage via created_by; contributors see the
-- projects they are listed on. NOTE: created_by is load-bearing for
-- createProject's `insert(...).select("id")` — a RETURNING row must pass this
-- SELECT policy, and the contributor row does not exist yet at that point.
CREATE POLICY projects_read ON public.projects
  FOR SELECT USING (
    status = 'approved'
    OR public.is_admin()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.project_contributors pc
      WHERE pc.project_id = projects.id AND pc.user_id = auth.uid()
    )
  );
-- Submissions always enter as `pending` and pinned to the caller: status
-- cannot be self-assigned and authorship cannot be spoofed, so REST cannot
-- bypass the moderation step in admin/proyek.
CREATE POLICY projects_insert_pending ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (status = 'pending' AND created_by = auth.uid());
-- Only admins move status (approve/reject/send back) — moderateProject().
CREATE POLICY projects_moderate ON public.projects
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
-- No DELETE policy: the app has no project-deletion flow.

-- project_contributors ───────────────────────────────────
ALTER TABLE public.project_contributors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS project_contributors_read ON public.project_contributors;
DROP POLICY IF EXISTS project_contributors_insert_own ON public.project_contributors;
CREATE POLICY project_contributors_read ON public.project_contributors
  FOR SELECT USING (true);
-- You may add YOURSELF as contributor only, and only while the project is
-- still pending — i.e. during its own submission (createProject inserts the
-- contributor row immediately after the project row). The EXISTS check runs
-- through the caller's OWN view of projects: outsiders cannot see someone
-- else's pending submission (see projects_read), so claiming contributorship
-- on another user's pending or on any approved project fails both checks.
CREATE POLICY project_contributors_insert_own ON public.project_contributors
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_contributors.project_id AND p.status = 'pending'
    )
  );

-- project_stacks ─────────────────────────────────────────
ALTER TABLE public.project_stacks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS project_stacks_read ON public.project_stacks;
DROP POLICY IF EXISTS project_stacks_insert_contributor ON public.project_stacks;
DROP POLICY IF EXISTS project_stacks_delete_admin ON public.project_stacks;
CREATE POLICY project_stacks_read ON public.project_stacks
  FOR SELECT USING (true);
-- Stack links may only be written for projects you contribute to. This is
-- why createProject() inserts the contributor row BEFORE the stack links.
CREATE POLICY project_stacks_insert_contributor ON public.project_stacks
  FOR INSERT TO authenticated
  WITH CHECK (
    -- Symmetric with the delete policy below: admins may link too.
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.project_contributors pc
      WHERE pc.project_id = project_stacks.project_id
        AND pc.user_id = auth.uid()
    )
  );
-- Detach-on-stack-delete in admin/stack (stacks.ts) — admin only.
CREATE POLICY project_stacks_delete_admin ON public.project_stacks
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- event_rsvp ─────────────────────────────────────────────
ALTER TABLE public.event_rsvp ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS event_rsvp_read ON public.event_rsvp;
DROP POLICY IF EXISTS event_rsvp_insert_own ON public.event_rsvp;
DROP POLICY IF EXISTS event_rsvp_update_own ON public.event_rsvp;
-- Attendee counts are public (event detail page renders "X peserta").
-- Rows only carry event_id + user_id + status — no personal data. Anon can
-- therefore see WHO is going (uuid + public profile), which matches what
-- the UI shows; tighten here if attendee lists must stay private.
CREATE POLICY event_rsvp_read ON public.event_rsvp
  FOR SELECT USING (true);
CREATE POLICY event_rsvp_insert_own ON public.event_rsvp
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
-- toggleRsvp flips going↔cancelled on the caller's own row.
CREATE POLICY event_rsvp_update_own ON public.event_rsvp
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
-- No DELETE: the toggle action updates status instead (rsvp.ts).

-- events ─────────────────────────────────────────────────
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS events_read ON public.events;
DROP POLICY IF EXISTS events_write_admin ON public.events;
CREATE POLICY events_read ON public.events
  FOR SELECT USING (true);
-- createEvent checks the role in code; updateEvent/deleteEvent do NOT
-- (they only verify a session exists) — this policy is the actual guard.
CREATE POLICY events_write_admin ON public.events
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- faq ────────────────────────────────────────────────────
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS faq_read ON public.faq;
DROP POLICY IF EXISTS faq_write_admin ON public.faq;
CREATE POLICY faq_read ON public.faq
  FOR SELECT USING (true);
-- createFaq / updateFaq / deleteFaq / moveFaqItem — all admin-gated in
-- code AND here.
CREATE POLICY faq_write_admin ON public.faq
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- stacks ─────────────────────────────────────────────────
ALTER TABLE public.stacks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS stacks_read ON public.stacks;
DROP POLICY IF EXISTS stacks_write_admin ON public.stacks;
CREATE POLICY stacks_read ON public.stacks
  FOR SELECT USING (true);
-- Admin CRUD in admin/stack (stacks.ts).
CREATE POLICY stacks_write_admin ON public.stacks
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- free_resources ─────────────────────────────────────────
ALTER TABLE public.free_resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS free_resources_read ON public.free_resources;
DROP POLICY IF EXISTS free_resources_write_admin ON public.free_resources;
DROP POLICY IF EXISTS free_resources_insert_admin ON public.free_resources;
DROP POLICY IF EXISTS free_resources_delete_admin ON public.free_resources;
CREATE POLICY free_resources_read ON public.free_resources
  FOR SELECT USING (true);
-- Upload/delete is admin (requireAdmin in resources.ts). UPDATE has no
-- policy on purpose: download_count moves only via increment_download_count().
-- PostgreSQL allows exactly one command per policy — hence two policies.
CREATE POLICY free_resources_insert_admin ON public.free_resources
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());
CREATE POLICY free_resources_delete_admin ON public.free_resources
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- community_settings ─────────────────────────────────────
ALTER TABLE public.community_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS community_settings_read ON public.community_settings;
DROP POLICY IF EXISTS community_settings_write_admin ON public.community_settings;
DROP POLICY IF EXISTS community_settings_insert_admin ON public.community_settings;
DROP POLICY IF EXISTS community_settings_update_admin ON public.community_settings;
CREATE POLICY community_settings_read ON public.community_settings
  FOR SELECT USING (true);
-- Singleton upserted by updateCommunitySettings() (admin-gated in code).
-- One command per policy in PostgreSQL — hence two policies.
CREATE POLICY community_settings_insert_admin ON public.community_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());
CREATE POLICY community_settings_update_admin ON public.community_settings
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- activities ─────────────────────────────────────────────
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS activities_read ON public.activities;
DROP POLICY IF EXISTS activities_write_admin ON public.activities;
CREATE POLICY activities_read ON public.activities
  FOR SELECT USING (true);
-- No code writes this table yet (landing sections still open — PRD §3.1);
-- admin-only so a future UI lands on the right default.
CREATE POLICY activities_write_admin ON public.activities
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- social_links ───────────────────────────────────────────
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS social_links_read ON public.social_links;
DROP POLICY IF EXISTS social_links_insert ON public.social_links;
DROP POLICY IF EXISTS social_links_delete ON public.social_links;
CREATE POLICY social_links_read ON public.social_links
  FOR SELECT USING (true);
-- addSocialLink() writes owner_type='user' + own id; the OR-is_admin branch
-- covers community-owned links (seeded/admin-managed).
CREATE POLICY social_links_insert ON public.social_links
  FOR INSERT TO authenticated
  WITH CHECK (
    (owner_type = 'user' AND owner_id = auth.uid())
    OR public.is_admin()
  );
-- removeSocialLink() filters on own id; admins may clean up any link.
CREATE POLICY social_links_delete ON public.social_links
  FOR DELETE TO authenticated
  USING (
    (owner_type = 'user' AND owner_id = auth.uid())
    OR public.is_admin()
  );
-- No UPDATE: the app edits links by delete + re-add.


-- ─── 3. Storage buckets ──────────────────────────────────
-- All four are public: display URLs are built with getPublicUrl() and the
-- files are plain images/archives. Idempotent re-run.
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('events',    'events',    true),
  ('projects',  'projects',  true),
  ('posts',     'posts',     true),
  ('resources', 'resources', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;


-- ─── 4. Storage object policies ──────────────────────────
-- storage.objects already has RLS enabled by Supabase. Read is public for
-- our four buckets (they ARE public buckets); writes are role- and
-- path-scoped to match the upload paths in the server actions:
--   events/    events.ts      → admin only
--   files/     resources.ts   → admin only
--   projects/  projects.ts    → any logged-in member
--   covers/    posts.ts       → any logged-in member
DROP POLICY IF EXISTS mdev_objects_read ON storage.objects;
CREATE POLICY mdev_objects_read ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('events', 'projects', 'posts', 'resources')
  );

DROP POLICY IF EXISTS mdev_events_insert ON storage.objects;
CREATE POLICY mdev_events_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'events' AND public.is_admin());

DROP POLICY IF EXISTS mdev_resources_insert ON storage.objects;
CREATE POLICY mdev_resources_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resources' AND public.is_admin());

DROP POLICY IF EXISTS mdev_projects_insert ON storage.objects;
CREATE POLICY mdev_projects_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'projects'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = 'projects'
  );

DROP POLICY IF EXISTS mdev_posts_insert ON storage.objects;
CREATE POLICY mdev_posts_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'posts'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = 'covers'
  );

-- Only admin cleanup paths call .remove(): resources.ts rollback on failed
-- insert + deleteResource. The other buckets have no deletion code path.
DROP POLICY IF EXISTS mdev_resources_delete ON storage.objects;
CREATE POLICY mdev_resources_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'resources' AND public.is_admin());

-- No UPDATE policies: every upload in the app uses upsert=false.
