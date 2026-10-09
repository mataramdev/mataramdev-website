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
        <h1 className="font-black uppercase leading-none text-2xl">
          Profil Saya
        </h1>
        <p className="mt-1 text-sm text-muted">
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

      <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-6 dark:border-[var(--hard-border)] dark:bg-surface-2">
        <h2 className="font-black uppercase text-sm">
          Proyek Saya
        </h2>
        <p className="mt-1 text-sm text-muted">
          Lihat status review proyek yang kamu kirim ke komunitas.
        </p>
        <Link
          href="/proyek-saya"
          className="mt-4 inline-block rounded-btn border-[3px] border-[var(--hard-border)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-3 dark:border-[var(--hard-border)] dark:text-foreground dark:hover:bg-surface-3"
        >
          Buka Proyek Saya →
        </Link>
      </div>

      <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-6 dark:border-[var(--hard-border)] dark:bg-surface-2">
        <h2 className="font-black uppercase text-sm">
          Artikel Saya
        </h2>
        <p className="mt-1 text-sm text-muted">
          Tulis artikel baru atau lanjutkan draf yang belum selesai.
        </p>
        <Link
          href="/artikel-saya"
          className="mt-4 inline-block rounded-btn border-[3px] border-[var(--hard-border)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-3 dark:border-[var(--hard-border)] dark:text-foreground dark:hover:bg-surface-3"
        >
          Buka Artikel Saya →
        </Link>
      </div>
    </div>
  );
}
