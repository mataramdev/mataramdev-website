import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  BTN_SM_RED,
  CONTAINER,
  HARD_CARD,
  PageHeader,
  SectionEmpty,
  initials,
} from "@/components/ui/brutalist";

export const metadata = {
  title: "Anggota — Mataram Dev",
  description:
    "Kenali developer, designer, dan kontributor yang tergabung di komunitas Mataram Dev.",
};

interface MemberRow {
  id: string;
  fullname: string | null;
  username: string | null;
  bio: string | null;
  image_url: string | null;
}

function displayName(row: MemberRow): string {
  return row.fullname?.trim() || row.username?.trim() || "Anggota";
}

export default async function MembersPage() {
  const supabase = await createClient();

  // Sengaja bukan `select("*")`: kolom `email` sudah di-revoke untuk anon
  // maupun authenticated (src/lib/db/policies.sql), jadi bintang akan dijawab
  // 42501 dan halaman publik ini mati.
  const { data, error } = await supabase
    .from("users")
    .select("id, fullname, username, bio, image_url")
    .order("fullname", { ascending: true });

  // Query gagal → error.tsx. Database bermasalah tidak boleh tampil sebagai
  // "belum ada anggota".
  if (error) {
    throw new Error(`Gagal mengambil data anggota: ${error.message}`);
  }

  const members = (data || []) as unknown as MemberRow[];

  return (
    <div className="bg-background py-16 sm:py-24">
      <div className={CONTAINER}>
        <PageHeader
          badge="Direktori"
          title="Anggota Komunitas"
          description="Orang-orang di balik Mataram Dev — developer, designer, dan siapa pun yang ikut membangun komunitas ini."
        />
        {members.length > 0 && (
          <p className="mt-4 font-mono text-xs uppercase text-muted">
            {members.length} anggota terdaftar
          </p>
        )}

        {members.length === 0 ? (
          <div className="mt-8">
            <SectionEmpty>Belum ada anggota yang terdaftar.</SectionEmpty>
            <div className="mt-6 flex justify-center">
              <Link href="/register" className={BTN_SM_RED}>
                Jadi Anggota Pertama
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <div
                key={member.id}
                className={`${HARD_CARD} flex h-full flex-col bg-surface-2 p-5`}
              >
                <div className="flex items-center gap-3">
                  {member.image_url ? (
                    <Image
                      src={member.image_url}
                      alt={`Foto profil ${displayName(member)}`}
                      width={56}
                      height={56}
                      className="size-14 shrink-0 border-2 border-[var(--hard-border)] object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex size-14 shrink-0 items-center justify-center border-2 border-[var(--hard-border)] bg-brand-yellow font-mono text-lg font-bold text-black"
                    >
                      {initials(displayName(member))}
                    </span>
                  )}

                  <div className="min-w-0">
                    <h2 className="truncate font-black uppercase text-base">
                      {displayName(member)}
                    </h2>
                    {member.username && (
                      <p className="truncate font-mono text-xs text-muted">
                        @{member.username}
                      </p>
                    )}
                  </div>
                </div>

                {member.bio && (
                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted">
                    {member.bio}
                  </p>
                )}

                {member.username && (
                  <Link
                    href={`/anggota/${encodeURIComponent(member.username)}`}
                    className="mt-auto pt-4 font-black uppercase text-xs text-accent-500"
                  >
                    Lihat profil →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
