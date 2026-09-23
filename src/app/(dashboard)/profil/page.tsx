import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import SocialLinksSection from "./SocialLinksSection";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Deliberately NOT `select("*")`: the email column is revoked for both
  // API roles (src/lib/db/policies.sql) — PostgREST would answer 42501.
  // The email comes from the auth session below, never from this table.
  const { data: profile } = await supabase
    .from("users")
    .select("id, fullname, username, bio, image_url")
    .eq("id", user.id)
    .single();

  const { data: socialLinks } = await supabase
    .from("social_links")
    .select("*")
    .eq("owner_type", "user")
    .eq("owner_id", user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Profil Saya
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Kelola informasi profil kamu.
        </p>
      </div>

      <ProfileForm
        initialData={{
          fullname: profile?.fullname || "",
          username: profile?.username || "",
          bio: profile?.bio || "",
          email: user.email || "",
        }}
      />

      <SocialLinksSection
        initialLinks={socialLinks || []}
      />

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Proyek Saya
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Lihat status review proyek yang kamu kirim ke komunitas.
        </p>
        <Link
          href="/proyek-saya"
          className="mt-4 inline-block rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Buka Proyek Saya →
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Artikel Saya
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Tulis artikel baru atau lanjutkan draf yang belum selesai.
        </p>
        <Link
          href="/artikel-saya"
          className="mt-4 inline-block rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Buka Artikel Saya →
        </Link>
      </div>
    </div>
  );
}
