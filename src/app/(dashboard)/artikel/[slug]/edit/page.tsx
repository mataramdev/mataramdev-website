import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostForm, { type PostFormValues } from "@/components/PostForm";
import { postStatusLabel } from "@/lib/postStatus";
import DeletePostButton from "./DeletePostButton";

export const metadata = {
  title: "Edit Artikel — Mataram Dev",
  description: "Perbarui isi artikel yang kamu tulis untuk komunitas Mataram Dev.",
};

interface EditPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Scoped to the author on purpose: someone else's article is indistinguishable
  // from a missing one here, so this page leaks nothing about other drafts.
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, excerpt, content, category, tags, status, image_url")
    .eq("slug", slug)
    .eq("author_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal memuat artikel: ${error.message}`);
  }

  if (!data) {
    notFound();
  }

  const values: PostFormValues = {
    id: data.id,
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    category: data.category || "tutorial",
    tags: data.tags,
    imageUrl: data.image_url,
  };

  const isPublished = data.status === "published";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/artikel-saya"
        className="text-sm font-medium text-teal-600 hover:underline dark:text-teal-300"
      >
        ← Artikel Saya
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="font-black uppercase leading-none text-3xl">
          Edit Artikel
        </h1>
        <span className="rounded-full bg-surface-3 px-2.5 py-0.5 text-xs font-medium text-muted dark:bg-surface-3 dark:text-foreground">
          {postStatusLabel(data.status)}
        </span>
      </div>

      <p className="mt-2 text-muted">
        Perubahan pada artikel yang sudah terbit langsung tampil di halaman
        Artikel. Alamat tautannya (slug) tetap, jadi link yang sudah dibagikan
        tidak rusak.
      </p>

      {isPublished && (
        <p className="mt-4 rounded-btn border-[3px] border-[var(--hard-border)] bg-brand-gold p-3 text-sm text-black">
          Artikel ini sedang terbit. Kamu bisa{" "}
          <Link href={`/artikel/${data.slug}`} className="font-medium underline">
            lihat versi publiknya
          </Link>{" "}
          lebih dulu sebelum menyimpan perubahan.
        </p>
      )}

      <div className="mt-8 rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-6 dark:border-[var(--hard-border)] dark:bg-surface-2">
        <PostForm values={values} />
      </div>

      <div className="mt-8 rounded-card border-[3px] border-[var(--hard-border)] bg-accent-50 p-6 dark:bg-accent-950">
        <h2 className="font-black uppercase text-sm text-accent-800 dark:text-accent-100">
          Hapus artikel
        </h2>
        <p className="mt-1 text-sm text-accent-700 dark:text-accent-200">
          Artikel beserta gambarnya dihapus permanen dan tidak bisa
          dikembalikan. Kalau hanya ingin menyembunyikannya, simpan sebagai
          draf saja.
        </p>
        <div className="mt-4">
          <DeletePostButton postId={data.id} slug={data.slug} />
        </div>
      </div>
    </div>
  );
}
