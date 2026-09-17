import { getAdminIdentity } from "@/lib/auth/admin";
import { guestPhotoDownloadUrl } from "@/lib/photos/cloudinary";
import type { AdminPhoto } from "@/lib/photos/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminIdentity())) return new Response(null, { status: 403 });
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response(null, { status: 400 });
  const { data } = await (
    await createSupabaseServerClient()
  )
    .from("photos")
    .select("cloudinary_public_id, cloudinary_delivery_type, format")
    .eq("id", id)
    .maybeSingle<
      Pick<
        AdminPhoto,
        "cloudinary_public_id" | "cloudinary_delivery_type" | "format"
      >
    >();
  if (!data) return new Response(null, { status: 404 });
  return Response.redirect(
    guestPhotoDownloadUrl(
      data.cloudinary_public_id,
      data.format,
      data.cloudinary_delivery_type,
    ),
    302,
  );
}
