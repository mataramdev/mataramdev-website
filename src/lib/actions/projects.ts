"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { projectSchema } from "@/lib/validations/project";
import { generateUniqueSlug } from "@/lib/utils";
import { isProjectStatus, type ProjectStatus } from "@/lib/projectStatus";
import type { ActionResult } from "@/types";

/**
 * Create a new project submission.
 * - Validates input with Zod
 * - Uploads image to Supabase Storage (optional)
 * - Inserts project record
 * - Links selected stacks
 * - Adds current user as contributor
 */
export async function createProject(
  _prevState: ActionResult<null>,
  formData: FormData
): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Anda harus login untuk mengirim proyek" };
  }

  // Parse stack IDs from FormData (multiple values)
  const stackIds = formData.getAll("stackIds") as string[];

  const raw = {
    name: formData.get("name") as string,
    content: (formData.get("content") as string) || undefined,
    githubUrl: (formData.get("githubUrl") as string) || undefined,
    demoUrl: (formData.get("demoUrl") as string) || undefined,
    stackIds,
  };

  const validated = projectSchema.safeParse(raw);
  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message || "Validasi gagal";
    return { success: false, error: firstError };
  }

  // Handle image upload
  const imageFile = formData.get("image") as File | null;
  let imageUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(imageFile.type)) {
      return {
        success: false,
        error: "Format gambar harus JPEG, PNG, WebP, atau GIF",
      };
    }

    // Validate file size (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      return { success: false, error: "Ukuran gambar maksimal 5MB" };
    }

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `projects/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("projects")
      .upload(filePath, imageFile);

    if (uploadError) {
      return { success: false, error: "Gagal mengunggah gambar" };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("projects").getPublicUrl(filePath);

    imageUrl = publicUrl;
  }

  const slug = generateUniqueSlug(validated.data.name);

  // Insert project
  const { data: project, error: insertError } = await supabase
    .from("projects")
    .insert({
      slug,
      name: validated.data.name,
      image_url: imageUrl,
      content: validated.data.content || null,
      github_url: validated.data.githubUrl || null,
      demo_url: validated.data.demoUrl || null,
      status: "pending",
      // RLS pins this to the caller (projects_insert_pending) and uses it to
      // let the author read the row back — the `.select("id")` below would
      // otherwise fail while the submission is still pending.
      created_by: user.id,
    })
    .select("id")
    .single();

  if (insertError || !project) {
    return { success: false, error: "Gagal membuat proyek" };
  }

  // Add current user as contributor FIRST: RLS on project_stacks only lets
  // you link stacks for a project you already contribute to, so this order
  // is load-bearing (src/lib/db/policies.sql → project_stacks policy).
  const { error: contributorError } = await supabase
    .from("project_contributors")
    .insert({
      project_id: project.id,
      user_id: user.id,
    });

  if (contributorError) {
    // Non-fatal: project created but contributor not added — the stack links
    // below are then rejected by RLS as well (both are logged, not thrown).
    console.error("Failed to add contributor:", contributorError);
  }

  // Link stacks
  if (validated.data.stackIds.length > 0) {
    const stackLinks = validated.data.stackIds.map((stackId) => ({
      project_id: project.id,
      stack_id: stackId,
    }));

    const { error: stackError } = await supabase
      .from("project_stacks")
      .insert(stackLinks);

    if (stackError) {
      // Non-fatal: project created but stacks not linked
      console.error("Failed to link stacks:", stackError);
    }
  }

  revalidatePath("/proyek");
  revalidatePath("/proyek-saya");
  // Land on "Proyek Saya" — the project is still `pending`, so the public
  // gallery would not show it and the submission would look like it failed.
  redirect("/proyek-saya?submitted=1");
}

/**
 * Approve, reject, or send a project back to the moderation queue.
 * Admin only — the role is re-checked here because middleware cannot
 * authorise (it only knows whether a session exists).
 */
export async function moderateProject(
  projectId: string,
  status: ProjectStatus
): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Anda harus login" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return { success: false, error: "Gagal memverifikasi akun Anda" };
  }

  if (profile?.role !== "admin") {
    return { success: false, error: "Hanya admin yang bisa memoderasi proyek" };
  }

  if (!isProjectStatus(status)) {
    return { success: false, error: "Status moderasi tidak dikenal" };
  }

  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId);

  if (error) {
    return { success: false, error: "Gagal memperbarui status proyek" };
  }

  // Best-effort: revalidate the project's own page too. A missing slug
  // (deleted row, RLS) must not turn a successful update into a failure.
  const { data: project } = await supabase
    .from("projects")
    .select("slug")
    .eq("id", projectId)
    .maybeSingle();

  revalidatePath("/admin/proyek");
  revalidatePath("/proyek");
  if (project?.slug) {
    revalidatePath(`/proyek/${project.slug}`);
  }

  return { success: true, data: null };
}

/**
 * Fetch all available stacks for selection.
 */
export async function getStacks(): Promise<
  ActionResult<{ id: string; name: string }[]>
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stacks")
    .select("id, name")
    .order("name");

  if (error) {
    return { success: false, error: "Gagal mengambil data stack" };
  }

  return { success: true, data: data || [] };
}
