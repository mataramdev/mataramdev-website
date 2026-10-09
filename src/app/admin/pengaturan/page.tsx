import { createClient } from "@/lib/supabase/server";
import CommunitySettingsForm from "./CommunitySettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("community_settings")
    .select("*")
    .limit(1)
    .single();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-black uppercase leading-none text-2xl">
          Pengaturan Komunitas
        </h1>
        <p className="mt-1 text-sm text-muted">
          Kelola informasi umum komunitas Mataram Dev.
        </p>
      </div>

      <CommunitySettingsForm
        initialData={{
          name: settings?.name || "",
          description: settings?.description || "",
          keywords: settings?.keywords?.join(", ") || "",
          address: settings?.address || "",
          mapsLocation: settings?.maps_location || "",
          lightLogoUrl: settings?.light_logo_url || "",
          darkLogoUrl: settings?.dark_logo_url || "",
        }}
      />
    </div>
  );
}
