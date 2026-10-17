import { createClient } from "@/lib/supabase/server";
import StackForm from "./StackForm";
import StackRow from "./StackRow";

export const metadata = {
  title: "Kelola Stack — Admin",
};

interface StackRowData {
  id: string;
  name: string;
  project_stacks: { project_id: string }[] | null;
}

export default async function AdminStacksPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stacks")
    .select("id, name, project_stacks(project_id)")
    .order("name");

  if (error) {
    throw new Error(`Gagal mengambil data stack: ${error.message}`);
  }

  const stacks = (data || []) as unknown as StackRowData[];

  const inUse = stacks.filter(
    (stack) => (stack.project_stacks?.length ?? 0) > 0
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-black uppercase leading-none text-2xl">
          Kelola Stack
        </h1>
        <p className="mt-1 text-sm text-muted">
          {stacks.length === 0
            ? "Belum ada stack. Form submit proyek butuh minimal satu stack."
            : `${stacks.length} stack terdaftar, ${inUse} sedang dipakai proyek.`}
        </p>
      </div>

      <StackForm />

      {stacks.length === 0 ? (
        <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-12 text-center dark:border-[var(--hard-border)] dark:bg-surface-2">
          <p className="text-muted">
            Tambahkan stack pertama di atas — misalnya Next.js, Laravel, atau
            Figma.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {stacks.map((stack) => (
            <StackRow
              key={stack.id}
              id={stack.id}
              name={stack.name}
              usageCount={stack.project_stacks?.length ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
