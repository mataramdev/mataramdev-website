import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Download endpoint for a free resource.
 *
 * The public page cannot link straight to the storage URL: the storage objects
 * are public, but only requests that go through here are counted. Downloads are
 * public, so no session is required (docs/PRD.md §4.4).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("free_resources")
    .select("file_url")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return new Response("Gagal mengambil data resource", { status: 500 });
  }

  if (!data?.file_url) {
    return new Response("Resource tidak ditemukan", { status: 404 });
  }

  let target: URL;
  try {
    target = new URL(data.file_url);
  } catch {
    console.error("[resource download] stored file_url is not a valid URL");
    return new Response("File resource tidak valid", { status: 500 });
  }

  // Best-effort counter via RPC: anon holds no UPDATE on free_resources, so
  // the increment runs through increment_download_count() (SECURITY DEFINER).
  // A rejected call must not block the download itself.
  const { error: countError } = await supabase.rpc("increment_download_count", {
    p_id: id,
  });

  if (countError) {
    console.error(
      "[resource download] failed to increment download_count:",
      countError
    );
  } else {
    revalidatePath("/resource");
    revalidatePath("/admin/resource");
  }

  return NextResponse.redirect(target, 302);
}
