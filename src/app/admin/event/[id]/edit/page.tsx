import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EventForm from "../../EventForm";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) {
    notFound();
  }

  const { data: speakerRows } = await supabase
    .from("event_speakers")
    .select("name, topic, photo_url")
    .eq("event_id", event.id)
    .order("order", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-black uppercase leading-none text-2xl">
          Edit Event
        </h1>
        <p className="mt-1 text-sm text-muted">
          Perbarui detail event &ldquo;{event.title}&rdquo;.
        </p>
      </div>

      <EventForm
        initialData={{
          id: event.id,
          title: event.title,
          excerpt: event.excerpt || "",
          description: event.description || "",
          status: event.status,
          startTime: event.start_time
            ? new Date(event.start_time).toISOString().slice(0, 16)
            : "",
          endTime: event.end_time
            ? new Date(event.end_time).toISOString().slice(0, 16)
            : "",
          locationName: event.location_name || "",
          locationUrl: event.location_url || "",
          imageUrl: event.image_url || "",
          speakers: (speakerRows ?? []).map((speaker) => ({
            name: speaker.name,
            topic: speaker.topic || "",
            photoUrl: speaker.photo_url || "",
          })),
        }}
      />
    </div>
  );
}
