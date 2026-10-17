"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types";

/**
 * Toggle RSVP status: join if not joined, cancel if already joined.
 */
export async function toggleRsvp(
  eventId: string
): Promise<ActionResult<{ joined: boolean; count: number }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Anda harus login untuk mendaftar event" };
  }

  // Check if user already RSVP'd
  const { data: existing } = await supabase
    .from("event_rsvp")
    .select("id, status")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    if (existing.status === "going") {
      // Cancel RSVP
      const { error } = await supabase
        .from("event_rsvp")
        .update({ status: "cancelled" })
        .eq("id", existing.id);

      if (error) {
        return { success: false, error: "Gagal membatalkan RSVP" };
      }
    } else {
      // Re-join (previously cancelled)
      const { error } = await supabase
        .from("event_rsvp")
        .update({ status: "going" })
        .eq("id", existing.id);

      if (error) {
        return { success: false, error: "Gagal mendaftar ulang" };
      }
    }
  } else {
    // New RSVP
    const { error } = await supabase.from("event_rsvp").insert({
      event_id: eventId,
      user_id: user.id,
      status: "going",
    });

    if (error) {
      return { success: false, error: "Gagal mendaftar event" };
    }
  }

  // Get updated count
  const { count } = await supabase
    .from("event_rsvp")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "going");

  revalidatePath("/event");
  // Halaman detail ikut di-segarkan supaya jumlah peserta hasil render server
  // tidak tertinggal saat pengguna menavigasi balik ke daftar event.
  revalidatePath("/event/[slug]", "page");

  const joined = existing ? existing.status !== "going" : true;
  return { success: true, data: { joined, count: count ?? 0 } };
}

/**
 * Get RSVP count for an event.
 */
export async function getRsvpCount(eventId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("event_rsvp")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "going");

  return count ?? 0;
}

/**
 * Get current user's RSVP status for an event.
 * Returns null if not logged in or not RSVP'd.
 */
export async function getUserRsvpStatus(
  eventId: string
): Promise<"going" | "cancelled" | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("event_rsvp")
    .select("status")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single();

  return data?.status ?? null;
}
