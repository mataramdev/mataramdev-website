-- ============================================================
-- Migrasi: persetujuan pendaftaran oleh admin
-- Jalankan sekali di database yang sudah ada:
--   psql "$DATABASE_URL" -f src/lib/db/approval.sql
--   (atau tempel isinya di Supabase → SQL Editor)
--
-- Database baru tidak butuh file ini: `pnpm db:push` sudah membuat kolomnya
-- dari src/lib/db/schema.ts. File ini idempotent, jadi aman dijalankan
-- berkali-kali, dan aman juga dijalankan di database baru.
-- ============================================================

-- 1. Enum. `create type` tidak punya IF NOT EXISTS, jadi dibungkus do-block.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'approval_status' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END
$$;

-- 2. Kolomnya. Saat kolom baru dibuat, SEMUA baris yang sudah ada adalah
--    pengguna lama (dibuat sebelum fitur approval ada) — mereka langsung
--    ditandai `approved`, bukan dibiarkan tertahan menunggu persetujuan yang
--    tidak pernah diminta. Baris BARU tidak kena backfill ini karena
--    defaultnya `pending` (lihat handle_new_user).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE public.users
      ADD COLUMN approval_status public.approval_status
      NOT NULL DEFAULT 'pending';

    UPDATE public.users SET approval_status = 'approved';

    RAISE NOTICE 'users.approval_status ditambahkan; % baris lama ditandai approved',
      (SELECT count(*) FROM public.users);
  ELSE
    RAISE NOTICE 'users.approval_status sudah ada — tidak ada yang diubah';
  END IF;
END
$$;
