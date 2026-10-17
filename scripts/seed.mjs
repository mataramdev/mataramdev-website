#!/usr/bin/env node
/**
 * Idempotent seeder — `pnpm db:seed`.
 *
 * Makes a fresh (or half-set-up) database usable in one command:
 *
 *   1. an admin account that can sign in *immediately*, without the
 *      confirmation-email round trip (the password is bcrypt-hashed straight
 *      into `auth.users`, and the matching `auth.identities` row is written
 *      too — GoTrue resolves email logins through that table, so an account
 *      without it answers "Invalid login credentials"),
 *   2. the single `community_settings` row so the landing page shows the real
 *      community name instead of its hardcoded fallback,
 *   3. the starter `stacks` list, because the project submission form needs at
 *      least one stack to offer.
 *
 * Only `DATABASE_URL` is required (the same one `pnpm db:push` uses) — no
 * service role key. Re-running is safe: existing rows are updated, not
 * duplicated.
 *
 * Override the defaults with environment variables (or a `.env.local` entry):
 *
 *   SEED_ADMIN_EMAIL=you@example.com
 *   SEED_ADMIN_PASSWORD=...
 *   SEED_ADMIN_FULLNAME="Nama Kamu"
 *   SEED_ADMIN_USERNAME=namakamu
 *   SEED_SKIP_STACKS=true      # leave `stacks` alone
 *   SEED_SKIP_SETTINGS=true    # leave `community_settings` alone
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

    // Strip one layer of matching quotes; `#` only starts a comment outside
    // quotes (a password may legitimately contain one).
    const value = rawValue.replace(/^(['"])(.*)\1$/, "$2");
    process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const ADMIN = {
  email: process.env.SEED_ADMIN_EMAIL ?? "admin@mataramdev.id",
  password: process.env.SEED_ADMIN_PASSWORD ?? "mataramdev123",
  fullname: process.env.SEED_ADMIN_FULLNAME ?? "Admin Mataram Dev",
  username: process.env.SEED_ADMIN_USERNAME ?? "admin",
};

const COMMUNITY = {
  name: process.env.SEED_COMMUNITY_NAME ?? "Mataram Dev",
  description:
    process.env.SEED_COMMUNITY_DESCRIPTION ??
    "Komunitas developer di Mataram, Lombok — tempat belajar, berbagi, dan membangun bersama.",
  keywords: ["mataram dev", "komunitas developer", "lombok", "ntb"],
  address: process.env.SEED_COMMUNITY_ADDRESS ?? "Mataram, Lombok, NTB",
};

/** Starter tags for project submissions, mirroring what `/admin/stack` adds. */
const STACKS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Vue.js",
  "Svelte",
  "Node.js",
  "Tailwind CSS",
  "PostgreSQL",
  "Supabase",
  "Laravel",
  "PHP",
  "Go",
  "Python",
  "Flutter",
  "React Native",
  "Docker",
  "Figma",
];

// ─── Helpers ──────────────────────────────────────────────

const uid = () => randomUUID();
const log = (label, message) => console.log(`   ${label.padEnd(10)} ${message}`);

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL belum diisi.\n\n" +
      "Ambil di Supabase → Project Settings → Database → Connection string → URI\n" +
      "(pakai Session pooler, port 5432), lalu taruh di .env.local:\n\n" +
      '   DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres\n',
  );
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1, onnotice: () => {} });

/** Creates the admin in `auth.users` (confirmed) or resets its password. */
async function upsertAdmin() {
  await sql`create extension if not exists pgcrypto`;

  const [existing] = await sql`
    select id from auth.users where email = ${ADMIN.email} limit 1
  `;
  const userId = existing?.id ?? uid();

  const appMetadata = { provider: "email", providers: ["email"] };
  const userMetadata = {
    sub: userId,
    email: ADMIN.email,
    fullname: ADMIN.fullname,
    email_verified: true,
    phone_verified: false,
  };

  if (existing) {
    // Confirmed on purpose: the account must work even while Supabase has
    // "Confirm email" enabled, otherwise a fresh deployment cannot be signed
    // into at all.
    await sql`
      update auth.users set
        encrypted_password = crypt(${ADMIN.password}, gen_salt('bf')),
        email_confirmed_at = now(),
        updated_at = now(),
        raw_app_meta_data = ${sql.json(appMetadata)},
        raw_user_meta_data = ${sql.json(userMetadata)}
      where id = ${userId}
    `;
    log("akun", `${ADMIN.email} → password direset & email dikonfirmasi`);
  } else {
    // `confirmed_at` is a generated column here (it mirrors
    // email_confirmed_at), so it must not be written explicitly.
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
        'authenticated', ${ADMIN.email},
        crypt(${ADMIN.password}, gen_salt('bf')),
        now(), now(), now(),
        ${sql.json(appMetadata)}, ${sql.json(userMetadata)},
        '', '', '', '', '', '', '', ''
      )
    `;
    log("akun", `${ADMIN.email} → dibuat (sudah terkonfirmasi)`);
  }

  // GoTrue looks the email/password login up here; without this row the
  // credentials are correct but sign-in still fails.
  const [identity] = await sql`
    select id from auth.identities
    where provider = 'email' and provider_id = ${userId} limit 1
  `;
  const identityData = {
    sub: userId,
    email: ADMIN.email,
    fullname: ADMIN.fullname,
    email_verified: true,
    phone_verified: false,
  };

  // `email` on this table is generated from `identity_data`, so it is read-only.
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

  // `username` is unique, so a collision falls back to leaving it empty
  // instead of aborting the whole seed.
  const [usernameTaken] = await sql`
    select id from public.users
    where username = ${ADMIN.username} and id <> ${userId} limit 1
  `;
  if (usernameTaken) {
    log("peringatan", `username "${ADMIN.username}" sudah dipakai akun lain — dibiarkan kosong`);
  }

  // `approval_status = 'approved'` is explicit, not inherited: the column's
  // default is `pending` (new sign-ups must be approved by an admin), and a
  // seeded admin that could not sign in would defeat the point of the seeder.
  await sql`
    insert into public.users (id, email, fullname, username, role, approval_status)
    values (
      ${userId}, ${ADMIN.email}, ${ADMIN.fullname},
      ${usernameTaken ? null : ADMIN.username}, 'admin', 'approved'
    )
    on conflict (id) do update set
      email = excluded.email,
      fullname = excluded.fullname,
      username = coalesce(excluded.username, public.users.username),
      role = 'admin',
      approval_status = 'approved',
      updated_at = now()
  `;
  log("profil", `public.users → role admin${usernameTaken ? "" : ` (@${ADMIN.username})`}`);

  return { userId, created: !existing };
}

async function seedStacks() {
  if (process.env.SEED_SKIP_STACKS === "true") {
    log("stack", "dilewati (SEED_SKIP_STACKS=true)");
    return 0;
  }

  const added = await sql`
    insert into public.stacks ${sql(STACKS.map((name) => ({ name })))}
    on conflict (name) do nothing
    returning name
  `;
  const total = await sql`select count(*)::int as total from public.stacks`;
  log("stack", `+${added.length} baru, total ${total[0].total}`);
  return added.length;
}

async function seedCommunitySettings() {
  if (process.env.SEED_SKIP_SETTINGS === "true") {
    log("pengaturan", "dilewati (SEED_SKIP_SETTINGS=true)");
    return false;
  }

  // Singleton row: the app always updates the first one, so mirror that.
  const [settings] = await sql`
    select id from public.community_settings limit 1
  `;

  if (settings) {
    await sql`
      update public.community_settings set
        name = ${COMMUNITY.name},
        description = ${COMMUNITY.description},
        keywords = ${COMMUNITY.keywords},
        address = ${COMMUNITY.address}
      where id = ${settings.id}
    `;
    log("pengaturan", `"${COMMUNITY.name}" diperbarui`);
  } else {
    await sql`
      insert into public.community_settings (name, description, keywords, address)
      values (${COMMUNITY.name}, ${COMMUNITY.description}, ${COMMUNITY.keywords}, ${COMMUNITY.address})
    `;
    log("pengaturan", `"${COMMUNITY.name}" dibuat`);
  }

  return true;
}

// ─── Run ──────────────────────────────────────────────────

try {
  console.log("\nMenyiapkan data awal…\n");

  const { created } = await upsertAdmin();
  await seedCommunitySettings();
  const stacksAdded = await seedStacks();

  console.log("\nSelesai. Login admin:\n");
  console.log(`   URL      http://localhost:3000/login`);
  console.log(`   Email    ${ADMIN.email}`);
  console.log(`   Password ${ADMIN.password}`);
  console.log(
    `\n   Akun ini role admin dan emailnya sudah dikonfirmasi, jadi bisa masuk` +
      `\n   walaupun "Confirm email" masih ON di Supabase.` +
      `\n   ${created ? "Akun baru dibuat" : "Akun sudah ada → passwordnya direset ke nilai di atas"}` +
      `${stacksAdded > 0 ? `; ${stacksAdded} stack ditambahkan.` : "."}\n`,
  );
} catch (error) {
  console.error("\nGagal menyiapkan data awal:\n");
  console.error(`   ${error.message}\n`);
  process.exitCode = 1;
} finally {
  await sql.end();
}
