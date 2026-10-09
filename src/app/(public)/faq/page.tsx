import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { sortFaqRows } from "@/lib/faq";
import {
  BTN_RED,
  FaqItem,
  HARD_CARD,
  NARROW,
  NEO_BADGE,
  SectionEmpty,
} from "@/components/ui/brutalist";

export const metadata = {
  title: "FAQ — Mataram Dev",
  description:
    "Pertanyaan yang sering ditanyakan seputar komunitas Mataram Dev.",
};

interface FaqRowData {
  id: string;
  question: string;
  answer: string;
  order: number | null;
}

export default async function FaqPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("faq")
    .select("id, question, answer, order");

  if (error) {
    throw new Error(`Gagal mengambil data FAQ: ${error.message}`);
  }

  const faqItems = sortFaqRows((data || []) as unknown as FaqRowData[]);

  return (
    <div className="bg-background py-16 sm:py-24">
      <div className={`${NARROW} text-center`}>
        <span className={`${NEO_BADGE} bg-accent-500 px-6 py-2.5 text-lg text-white`}>
          FAQ
        </span>
        <h1 className="mt-4 font-black uppercase leading-none text-3xl sm:text-4xl lg:text-5xl">
          Pertanyaan Umum
        </h1>
        <p className="mt-3 text-base text-muted">
          Hal-hal yang paling sering ditanyakan soal komunitas. Kalau
          pertanyaanmu belum ada di sini, tanya langsung di event terdekat.
        </p>

        {faqItems.length === 0 ? (
          <SectionEmpty>
            Belum ada FAQ yang dipublikasikan. Nantikan ya!
          </SectionEmpty>
        ) : (
          <div className="mt-10 flex flex-col gap-4 text-left">
            {faqItems.map((item, index) => (
              <FaqItem
                key={item.id}
                question={item.question}
                answer={item.answer}
                number={String(index + 1).padStart(2, "0")}
                defaultOpen={index === 0}
              />
            ))}
          </div>
        )}

        <div className={`${HARD_CARD} mt-10 bg-surface-2 p-8`}>
          <p className="font-black text-lg">Masih ada pertanyaan?</p>
          <p className="mt-1 text-sm text-muted">
            Datang ke event terdekat dan tanyakan langsung ke pengurus.
          </p>
          <div className="mt-5 flex justify-center">
            <Link href="/event" className={BTN_RED}>
              Lihat Event Terdekat →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
