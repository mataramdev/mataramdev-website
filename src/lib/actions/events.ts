"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { eventSchema, type EventInput } from "@/lib/validations/event";
import { generateUniqueSlug } from "@/lib/utils";
import type { ActionResult } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * ── Pembicara event ───────────────────────────────────────
 *
 * Form admin mengirim satu baris pembicara per indeks: `speakerName[]`,
 * `speakerTopic[]`, `speakerPhotoUrl[]` (foto dari galeri bawaan) dan
 * `speakerPhoto[]` (berkas unggahan). Nama + foto bebas — tidak ada FK ke
 * `users` (lihat catatan di src/lib/db/schema.ts), jadi pembicara dari luar
 * komunitas tetap bisa dicatat.
 */
interface SpeakerRow {
  name: string;
  topic: string | null;
  photoUrl: string | null;
  file: File | null;
}

function readSpeakerRows(formData: FormData): SpeakerRow[] {
  const names = formData.getAll("speakerName").map(String);
  const topics = formData.getAll("speakerTopic").map(String);
  const photoUrls = formData.getAll("speakerPhotoUrl").map(String);
  const files = formData.getAll("speakerPhoto");

  return names.flatMap((rawName, index) => {
    const name = rawName.trim();
    // Baris kosong (admin menambah lalu membiarkannya) cukup diabaikan.
    if (!name) return [];

    const file = files[index];
    return [
      {
        name,
        topic: (topics[index] ?? "").trim() || null,
        photoUrl: (photoUrls[index] ?? "").trim() || null,
        file: file instanceof File && file.size > 0 ? file : null,
      },
    ];
  });
}

async function uploadSpeakerPhoto(
  supabase: SupabaseClient,
  file: File
): Promise<string | null> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `speakers/${fileName}`;

  const { error } = await supabase.storage
    .from("events")
    .upload(filePath, file);

  if (error) return null;

  const {
    data: { publicUrl },
  } = supabase.storage.from("events").getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Menyimpan ulang seluruh daftar pembicara event (replace-all): daftar di form
 * adalah sumber kebenaran, jadi baris yang dihapus admin ikut hilang. Mengembalikan
 * pesan error, atau `null` kalau sukses.
 */
async function saveSpeakers(
  supabase: SupabaseClient,
  eventId: string,
  formData: FormData
): Promise<string | null> {
  const rows = readSpeakerRows(formData);
  const payload: {
    event_id: string;
    name: string;
    topic: string | null;
    photo_url: string | null;
    order: number;
  }[] = [];

  // Unggah dulu SEMUA foto sebelum menyentuh tabel: kalau ada unggahan yang
  // gagal, daftar pembicara yang lama tidak sudah keburu terhapus.
  for (const [index, row] of rows.entries()) {
    let photoUrl = row.photoUrl;

    if (row.file) {
      const uploaded = await uploadSpeakerPhoto(supabase, row.file);
      if (!uploaded) return "Gagal mengunggah foto pembicara";
      photoUrl = uploaded;
    }

    payload.push({
      event_id: eventId,
      name: row.name,
      topic: row.topic,
      photo_url: photoUrl,
      order: index,
    });
  }

  const { error: deleteError } = await supabase
    .from("event_speakers")
    .delete()
    .eq("event_id", eventId);

  if (deleteError) return "Gagal menyimpan pembicara event";
  if (payload.length === 0) return null;

  const { error } = await supabase.from("event_speakers").insert(payload);
  if (error) return "Gagal menyimpan pembicara event";

  return null;
}

export async function createEvent(
  _prevState: ActionResult<null>,
  formData: FormData
): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Hanya admin yang bisa membuat event" };
  }

  const raw = {
    title: formData.get("title") as string,
    excerpt: (formData.get("excerpt") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    status: formData.get("status") as EventInput["status"],
    startTime: formData.get("startTime") as string,
    endTime: (formData.get("endTime") as string) || undefined,
    locationName: (formData.get("locationName") as string) || undefined,
    locationUrl: (formData.get("locationUrl") as string) || undefined,
  };

  const validated = eventSchema.safeParse(raw);
  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message || "Validasi gagal";
    return { success: false, error: firstError };
  }

  // Handle image upload
  const imageFile = formData.get("image") as File | null;
  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `events/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("events")
      .upload(filePath, imageFile);

    if (uploadError) {
      return { success: false, error: "Gagal mengunggah gambar" };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("events").getPublicUrl(filePath);

    imageUrl = publicUrl;
  }

  const slug = generateUniqueSlug(validated.data.title);

  const { data: created, error } = await supabase
    .from("events")
    .insert({
      slug,
      title: validated.data.title,
      excerpt: validated.data.excerpt || null,
      description: validated.data.description || null,
      image_url: imageUrl,
      status: validated.data.status,
      start_time: new Date(validated.data.startTime).toISOString(),
      end_time: validated.data.endTime
        ? new Date(validated.data.endTime).toISOString()
        : null,
      location_name: validated.data.locationName || null,
      location_url: validated.data.locationUrl || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !created) {
    return { success: false, error: "Gagal membuat event" };
  }

  const speakerError = await saveSpeakers(supabase, created.id, formData);
  if (speakerError) {
    return { success: false, error: speakerError };
  }

  revalidatePath("/event");
  redirect("/admin/event");
}

export async function updateEvent(
  eventId: string,
  _prevState: ActionResult<null>,
  formData: FormData
): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  const raw = {
    title: formData.get("title") as string,
    excerpt: (formData.get("excerpt") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
    status: formData.get("status") as EventInput["status"],
    startTime: formData.get("startTime") as string,
    endTime: (formData.get("endTime") as string) || undefined,
    locationName: (formData.get("locationName") as string) || undefined,
    locationUrl: (formData.get("locationUrl") as string) || undefined,
  };

  const validated = eventSchema.safeParse(raw);
  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message || "Validasi gagal";
    return { success: false, error: firstError };
  }

  // Handle image upload
  const imageFile = formData.get("image") as File | null;
  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `events/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("events")
      .upload(filePath, imageFile);

    if (uploadError) {
      return { success: false, error: "Gagal mengunggah gambar" };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("events").getPublicUrl(filePath);

    imageUrl = publicUrl;
  }

  const updateData: Record<string, unknown> = {
    title: validated.data.title,
    excerpt: validated.data.excerpt || null,
    description: validated.data.description || null,
    status: validated.data.status,
    start_time: new Date(validated.data.startTime).toISOString(),
    end_time: validated.data.endTime
      ? new Date(validated.data.endTime).toISOString()
      : null,
    location_name: validated.data.locationName || null,
    location_url: validated.data.locationUrl || null,
  };

  if (imageUrl) {
    updateData.image_url = imageUrl;
  }

  const { error } = await supabase
    .from("events")
    .update(updateData)
    .eq("id", eventId);

  if (error) {
    return { success: false, error: "Gagal memperbarui event" };
  }

  const speakerError = await saveSpeakers(supabase, eventId, formData);
  if (speakerError) {
    return { success: false, error: speakerError };
  }

  revalidatePath("/admin/event");
  revalidatePath("/event/[slug]", "page");
  redirect("/admin/event");
}

export async function deleteEvent(
  eventId: string
): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) {
    return { success: false, error: "Gagal menghapus event" };
  }

  revalidatePath("/admin/event");
  return { success: true, data: null };
}
