"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { postSchema, parseTags, type PostInput } from "@/lib/validations/post";
import { generateUniqueSlug } from "@/lib/utils";
import type { ActionResult } from "@/types";

/**
 * Cover images live in their own bucket to mirror the events/projects layout.
 * The bucket must exist and be public (see docs/RECAP.md deployment checklist).
 */
const POST_IMAGE_BUCKET = "posts";

function revalidatePostPages() {
  // The dashboard route group does not share a URL prefix with the public
  // pages, so each path is revalidated explicitly.
  revalidatePath("/artikel");
  revalidatePath("/artikel-saya");
}

export async function createPost(
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
    title: (formData.get("title") as string) || "",
    excerpt: (formData.get("excerpt") as string) || undefined,
    content: (formData.get("content") as string) || "",
    category: formData.get("category") as PostInput["category"],
    tags: (formData.get("tags") as string) || undefined,
    // The submit button carries the status, so one form can both save a draft
    // and publish.
    status: (formData.get("status") as PostInput["status"]) || "draft",
  };

  const validated = postSchema.safeParse(raw);
  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message || "Validasi gagal";
    return { success: false, error: firstError };
  }

  const { title, excerpt, content, category, status } = validated.data;
  const tags = parseTags(validated.data.tags);

  // Handle cover upload
  const imageFile = formData.get("image") as File | null;
  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `covers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(POST_IMAGE_BUCKET)
      .upload(filePath, imageFile);

    if (uploadError) {
      return { success: false, error: "Gagal mengunggah gambar" };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(POST_IMAGE_BUCKET).getPublicUrl(filePath);

    imageUrl = publicUrl;
  }

  const { error } = await supabase.from("posts").insert({
    slug: generateUniqueSlug(title),
    title,
    excerpt: excerpt || null,
    image_url: imageUrl,
    content,
    author_id: user.id,
    status,
    category,
    tags,
    published_date: status === "published" ? new Date().toISOString() : null,
  });

  if (error) {
    return { success: false, error: "Gagal menyimpan artikel" };
  }

  revalidatePostPages();
  redirect(`/artikel-saya?created=${status}`);
}

/**
 * Updates one of the current user's articles. The slug is deliberately kept:
 * a published article's URL must not break just because its title changed.
 * Ownership is re-checked here rather than trusted from the edit page.
 */
export async function updatePost(
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

  const postId = (formData.get("postId") as string) || "";
  if (!postId) {
    return { success: false, error: "Artikel tidak dikenal" };
  }

  const raw = {
    title: (formData.get("title") as string) || "",
    excerpt: (formData.get("excerpt") as string) || undefined,
    content: (formData.get("content") as string) || "",
    category: formData.get("category") as PostInput["category"],
    tags: (formData.get("tags") as string) || undefined,
    status: (formData.get("status") as PostInput["status"]) || "draft",
  };

  const validated = postSchema.safeParse(raw);
  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message || "Validasi gagal";
    return { success: false, error: firstError };
  }

  const { title, excerpt, content, category, status } = validated.data;
  const tags = parseTags(validated.data.tags);

  // Read the row first: this both proves ownership (RLS answers 0 rows for
  // someone else's article) and keeps the original publish date.
  const { data: existing, error: readError } = await supabase
    .from("posts")
    .select("id, author_id, published_date")
    .eq("id", postId)
    .maybeSingle();

  if (readError) {
    return { success: false, error: "Gagal memuat artikel" };
  }
  if (!existing || existing.author_id !== user.id) {
    return { success: false, error: "Artikel tidak ditemukan" };
  }

  // Handle cover upload — an empty file input keeps the current cover.
  const imageFile = formData.get("image") as File | null;
  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `covers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(POST_IMAGE_BUCKET)
      .upload(filePath, imageFile);

    if (uploadError) {
      return { success: false, error: "Gagal mengunggah gambar" };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(POST_IMAGE_BUCKET).getPublicUrl(filePath);

    imageUrl = publicUrl;
  }

  const updateData: Record<string, unknown> = {
    title,
    excerpt: excerpt || null,
    content,
    category,
    tags,
    status,
    // First publish stamps the date; later edits (and unpublishing) keep it so
    // the article never appears to jump around in the listing.
    published_date:
      status === "published"
        ? existing.published_date || new Date().toISOString()
        : existing.published_date,
  };

  if (imageUrl) {
    updateData.image_url = imageUrl;
  }

  const { error } = await supabase
    .from("posts")
    .update(updateData)
    .eq("id", postId)
    .eq("author_id", user.id);

  if (error) {
    return { success: false, error: "Gagal memperbarui artikel" };
  }

  revalidatePostPages();
  redirect(`/artikel-saya?updated=${status}`);
}

/**
 * Deletes one of the current user's articles. The row is selected back so a
 * delete that RLS silently refused (0 rows) is reported as a failure instead
 * of a success the author cannot see.
 */
export async function deletePost(
  postId: string
): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  const { data, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("author_id", user.id)
    .select("id");

  if (error) {
    return { success: false, error: "Gagal menghapus artikel" };
  }

  if (!data || data.length === 0) {
    return { success: false, error: "Artikel tidak ditemukan" };
  }

  revalidatePostPages();
  return { success: true, data: null };
}

/**
 * Publishes one of the current user's drafts. Ownership is checked here rather
 * than trusted from the page that renders the button.
 */
export async function publishPost(
  postId: string
): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  const { error } = await supabase
    .from("posts")
    .update({
      status: "published",
      published_date: new Date().toISOString(),
    })
    .eq("id", postId)
    .eq("author_id", user.id);

  if (error) {
    return { success: false, error: "Gagal menerbitkan artikel" };
  }

  revalidatePostPages();
  return { success: true, data: null };
}
