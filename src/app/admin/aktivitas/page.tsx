import { createClient } from "@/lib/supabase/server";
import { sortByOrder, type OrderRow } from "@/lib/ordering";
import ActivityForm from "./ActivityForm";
import ActivityRow from "./ActivityRow";

export const metadata = {
  title: "Aktivitas — Admin",
};

interface ActivityRowData extends OrderRow {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order: number | null;
}

export default async function AdminActivitiesPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activities")
    .select("id, name, description, icon, color, order");

  if (error) {
    throw new Error(`Gagal mengambil data aktivitas: ${error.message}`);
  }

  // Same canonical order the landing page and the move action use, so the
  // numbers next to the arrows match what visitors actually see.
  const activities = sortByOrder((data || []) as unknown as ActivityRowData[]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-black uppercase leading-none text-2xl">
          Aktivitas Komunitas
        </h1>
        <p className="mt-1 text-sm text-muted">
          {activities.length === 0
            ? "Belum ada aktivitas. Tambahkan yang pertama lewat form di bawah."
            : `${activities.length} aktivitas, tampil berurutan di halaman depan.`}
        </p>
      </div>

      <ActivityForm />

      {activities.length === 0 ? (
        <div className="rounded-card border-[3px] border-[var(--hard-border)] bg-surface-2 p-12 text-center dark:border-[var(--hard-border)] dark:bg-surface-2">
          <p className="text-muted">
            Urutan bisa diatur dengan tombol ▲ ▼ di setiap baris setelah ada lebih
            dari satu aktivitas.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity, index) => (
            <ActivityRow
              key={activity.id}
              id={activity.id}
              name={activity.name}
              description={activity.description}
              icon={activity.icon}
              color={activity.color}
              position={index}
              total={activities.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
