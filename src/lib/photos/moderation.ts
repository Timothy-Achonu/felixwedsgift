import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";

import { getAdminIdentity } from "@/lib/auth/admin";
import {
  changeGuestPhotoDelivery,
  destroyGuestPhoto,
} from "@/lib/photos/cloudinary";
import type { AdminPhoto } from "@/lib/photos/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { weddingGalleryTag } from "@/lib/wedding/cache";

export function invalidatePhotoPages() {
  revalidateTag(weddingGalleryTag, { expire: 0 });
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin");
  revalidatePath("/admin/photos");
}

export async function moderatePhoto(
  id: string,
  action: "approve" | "reject",
  expectedRevision: number,
) {
  if (!(await getAdminIdentity()))
    return {
      ok: false as const,
      status: 403,
      error: "Admin authorization required.",
    };
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .maybeSingle<AdminPhoto>();
  if (!data)
    return { ok: false as const, status: 404, error: "Photograph not found." };
  if (data.revision !== expectedRevision)
    return {
      ok: false as const,
      status: 409,
      error: "This photograph changed. Reload and try again.",
    };
  const claimedRevision = data.revision + 1;
  const { data: claim } = await supabase
    .from("photos")
    .update({ revision: claimedRevision, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("revision", expectedRevision)
    .select("id")
    .maybeSingle();
  if (!claim)
    return {
      ok: false as const,
      status: 409,
      error: "This photograph changed. Reload and try again.",
    };
  const releaseClaim = () =>
    supabase
      .from("photos")
      .update({ revision: data.revision, updated_at: data.updated_at })
      .eq("id", id)
      .eq("revision", claimedRevision);
  const targetStatus = action === "approve" ? "APPROVED" : "REJECTED";
  const targetType = action === "approve" ? "upload" : "authenticated";
  let secureUrl = data.secure_url;
  try {
    if (data.cloudinary_delivery_type !== targetType) {
      secureUrl = await changeGuestPhotoDelivery(
        data.cloudinary_public_id,
        data.cloudinary_delivery_type,
        targetType,
      );
    }
  } catch (error) {
    await releaseClaim();
    throw error;
  }
  const now = new Date().toISOString();
  const { data: updated, error } = await supabase
    .from("photos")
    .update({
      secure_url: secureUrl,
      cloudinary_delivery_type: targetType,
      status: targetStatus,
      approved_at: action === "approve" ? now : null,
      updated_at: now,
      revision: claimedRevision,
    })
    .eq("id", id)
    .eq("revision", claimedRevision)
    .select("revision, status")
    .maybeSingle();
  if (error || !updated) {
    try {
      if (data.cloudinary_delivery_type !== targetType)
        await changeGuestPhotoDelivery(
          data.cloudinary_public_id,
          targetType,
          data.cloudinary_delivery_type,
        );
    } catch (rollbackError) {
      console.error("Photo moderation rollback failed", rollbackError);
    }
    await releaseClaim();
    return {
      ok: false as const,
      status: 409,
      error: "The photograph could not be updated.",
    };
  }
  invalidatePhotoPages();
  return { ok: true as const, photo: updated };
}

export async function removePhoto(id: string, expectedRevision: number) {
  if (!(await getAdminIdentity()))
    return {
      ok: false as const,
      status: 403,
      error: "Admin authorization required.",
    };
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .maybeSingle<AdminPhoto>();
  if (!data) return { ok: true as const };
  if (data.revision !== expectedRevision)
    return {
      ok: false as const,
      status: 409,
      error: "This photograph changed. Reload and try again.",
    };
  const claimedRevision = data.revision + 1;
  const { data: claim } = await supabase
    .from("photos")
    .update({ revision: claimedRevision, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("revision", expectedRevision)
    .select("id")
    .maybeSingle();
  if (!claim)
    return {
      ok: false as const,
      status: 409,
      error: "This photograph changed. Reload and try again.",
    };
  try {
    await destroyGuestPhoto(
      data.cloudinary_public_id,
      data.cloudinary_delivery_type,
    );
  } catch (error) {
    await supabase
      .from("photos")
      .update({ revision: data.revision, updated_at: data.updated_at })
      .eq("id", id)
      .eq("revision", claimedRevision);
    throw error;
  }
  const { error } = await supabase
    .from("photos")
    .delete()
    .eq("id", id)
    .eq("revision", claimedRevision);
  if (error)
    return {
      ok: false as const,
      status: 409,
      error: "The database record could not be removed.",
    };
  invalidatePhotoPages();
  return { ok: true as const };
}
