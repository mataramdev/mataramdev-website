import { createClient } from "@/lib/supabase/server";
import { sortFaqRows } from "@/lib/faq";
import FaqForm from "./FaqForm";
import FaqRow from "./FaqRow";

export const metadata = {
  title: "FAQ — Admin",
};

interface FaqRowData {
  id: string;
  question: string;
  answer: string;
  order: number | null;
}

export default async function AdminFaqPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("faq")
    .select("id, question, answer, order");

  if (error) {
    throw new Error(`Gagal mengambil data FAQ: ${error.message}`);
  }

  // Same canonical order the public page and the move action use, so the
  // numbers next to the arrows match what visitors actually see.
  const faqItems = sortFaqRows((data || []) as unknown as FaqRowData[]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-black uppercase leading-none text-2xl">
          FAQ
        </h1>
        <p className="mt-1 text-sm text-muted">
          {faqItems.length === 0
            ? "Belum ada FAQ. Tambahkan pertanyaan pertama lewat form di bawah."
            : `${faqItems.length} pertanyaan, tampil berurutan di halaman publik /faq.`}
        </p>
      </div>

      <FaqForm />

      {faqItems.length === 0 ? (
        <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-12 text-center dark:border-[var(--hard-border)] dark:bg-surface-2">
          <p className="text-muted">
            Urutan bisa diatur dengan tombol ▲ ▼ di setiap baris setelah ada
            lebih dari satu pertanyaan.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {faqItems.map((item, index) => (
            <FaqRow
              key={item.id}
              id={item.id}
              question={item.question}
              answer={item.answer}
              position={index}
              total={faqItems.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
