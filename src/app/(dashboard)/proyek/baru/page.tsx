import Link from "next/link";
import ProjectForm from "@/components/ProjectForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Kirim Proyek — Mataram Dev",
  description: "Kirim proyek Anda untuk ditampilkan di showcase komunitas.",
};

export default async function NewProjectPage() {
  // Stacks are fetched on the server so the checkboxes render on the first
  // response — the old client-side fetch left the form unusable without JS
  // ("Memuat stack..." forever, no way to pick one). A failed query throws to
  // error.tsx instead of showing an empty list, which would look like "no
  // stacks exist".
  const supabase = await createClient();
  const { data: stacks, error } = await supabase
    .from("stacks")
    .select("id, name")
    .order("name");

  if (error) {
    throw new Error("Gagal memuat daftar stack");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/proyek"
        className="text-sm font-medium text-teal-600 hover:underline dark:text-teal-300"
      >
        ← Kembali ke proyek
      </Link>

      <h1 className="mt-6 font-black uppercase leading-none text-3xl">
        Kirim Proyek
      </h1>
      <p className="mt-2 text-muted">
        Tunjukkan proyek yang sudah kamu buat ke komunitas. Proyek akan
        diverifikasi oleh admin sebelum tampil.
      </p>

      <div className="mt-8 rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-6 dark:border-[var(--hard-border)] dark:bg-surface-2">
        <ProjectForm stacks={stacks ?? []} />
      </div>
    </div>
  );
}
