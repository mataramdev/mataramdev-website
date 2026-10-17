import Link from "next/link";
import PostForm from "@/components/PostForm";

export const metadata = {
  title: "Tulis Artikel — Mataram Dev",
  description: "Tulis artikel untuk dibagikan ke komunitas Mataram Dev.",
};

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/artikel-saya"
        className="text-sm font-medium text-teal-600 hover:underline dark:text-teal-300"
      >
        ← Artikel Saya
      </Link>

      <h1 className="mt-6 font-black uppercase leading-none text-3xl">
        Tulis Artikel
      </h1>
      <p className="mt-2 text-muted">
        Bagikan tutorial, tips, atau cerita kamu. Simpan sebagai draf dulu kalau
        belum selesai — draf hanya terlihat oleh kamu.
      </p>

      <div className="mt-8 rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-6 dark:border-[var(--hard-border)] dark:bg-surface-2">
        <PostForm />
      </div>
    </div>
  );
}
