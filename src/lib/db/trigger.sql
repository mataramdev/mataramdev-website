-- ============================================================
-- Trigger: Sync auth.users → public.users on new registration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- A profile row can outlive its auth user on databases created before the
  -- users_id_fkey constraint below existed. Left in place it makes this INSERT
  -- fail on users_email_unique, so the whole sign-up errors out. Drop the stale
  -- row instead of reusing it: re-adopting it would hand a brand-new account the
  -- role and authored content of the old one.
  DELETE FROM public.users WHERE email = NEW.email AND id <> NEW.id;

  -- `is_active = false` + `approval_status` bawaan `pending`: akun baru memang
  -- belum boleh dipakai. Admin yang menyetujui di /admin/users akan
  -- mengaktifkannya sekaligus (admin_set_user_approval), jadi satu tindakan
  -- saja sudah cukup — tidak ada tombol kedua yang harus ditekan tanpa
  -- petunjuk, dan kolom Status di daftar pengguna tidak menampilkan "Aktif"
  -- untuk akun yang sebenarnya belum boleh masuk.
  INSERT INTO public.users (id, email, fullname, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'fullname', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    'contributor',
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 2. Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Optional: Also update email if it changes in auth.users
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET email = NEW.email,
      updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_update();

-- ============================================================
-- 3. Keep public.users tied to its auth user
-- ============================================================
-- public.users.id mirrors auth.users.id, but the column had no foreign key at
-- all. Deleting an account (Supabase dashboard, admin API) therefore left the
-- profile behind: a ghost member on /anggota, and a hard failure the next time
-- anyone signed up with that email — the trigger's INSERT tripped
-- users_email_unique. Verified on a real database, see docs/RECAP.md.
--
-- Idempotent: the prune runs first, so the constraint can be added to a
-- database that already carries orphans. NOTE: drizzle-kit push does not know
-- about this constraint (it lives in another schema); re-run this file if a
-- push ever removes it.

DELETE FROM public.users u
WHERE NOT EXISTS (SELECT 1 FROM auth.users a WHERE a.id = u.id);

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE public.users
  ADD CONSTRAINT users_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Deleting an account that already authored content still fails, but loudly
-- (projects.created_by, posts.author_id, … reference public.users without a
-- delete rule) instead of silently orphaning the profile. Cleaning up that
-- content first is a deliberate manual step.
