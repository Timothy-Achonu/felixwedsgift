import { createHmac } from "node:crypto";

import { cookies } from "next/headers";

import { env } from "@/env";
import { destroyGuestPhoto, verifyGuestPhoto } from "@/lib/photos/cloudinary";
import {
  maximumGuestPhotoBatch,
  maximumPhotoCaptionLength,
} from "@/lib/photos/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Completion = { id?: unknown; caption?: unknown };

export async function POST(request: Request) {
  const secret = env.UPLOAD_RATE_LIMIT_SECRET;
  if (!secret || !env.SUPABASE_SECRET_KEY) {
    return Response.json(
      { error: "Photo sharing is not configured yet." },
      { status: 503 },
    );
  }
  const deviceToken = (await cookies()).get("wedding-upload-device")?.value;
  if (!deviceToken) {
    return Response.json(
      { error: "This upload authorization expired." },
      { status: 401 },
    );
  }
  const deviceHash = createHmac("sha256", secret)
    .update(deviceToken)
    .digest("hex");
  let input: { photos?: unknown };
  try {
    input = (await request.json()) as typeof input;
  } catch {
    return Response.json(
      { error: "Invalid completion request." },
      { status: 400 },
    );
  }
  if (
    !Array.isArray(input.photos) ||
    input.photos.length < 1 ||
    input.photos.length > maximumGuestPhotoBatch
  ) {
    return Response.json(
      { error: "Invalid completion request." },
      { status: 400 },
    );
  }
  const photos = input.photos as Completion[];
  if (
    photos.some(
      (photo) =>
        typeof photo.id !== "string" ||
        !/^[0-9a-f-]{36}$/.test(photo.id) ||
        (photo.caption !== null &&
          photo.caption !== undefined &&
          (typeof photo.caption !== "string" ||
            photo.caption.trim().length > maximumPhotoCaptionLength)),
    )
  ) {
    return Response.json(
      { error: "Invalid photograph details." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const results = await Promise.all(
    photos.map(async (photo) => {
      const id = photo.id as string;
      const { data: existing } = await supabase
        .from("photos")
        .select("id")
        .eq("id", id)
        .maybeSingle();
      if (existing) return { id, ok: true };
      const { data: reservation, error: reservationError } = await supabase
        .from("photo_upload_reservations")
        .select(
          "cloudinary_public_id, original_filename, expires_at, device_hash",
        )
        .eq("id", id)
        .maybeSingle();
      if (
        reservationError ||
        !reservation ||
        reservation.device_hash !== deviceHash ||
        new Date(reservation.expires_at).getTime() < Date.now()
      ) {
        return { id, ok: false, error: "This upload authorization expired." };
      }
      try {
        const asset = await verifyGuestPhoto(reservation.cloudinary_public_id);
        const caption =
          typeof photo.caption === "string" && photo.caption.trim()
            ? photo.caption.trim()
            : null;
        const { error } = await supabase.from("photos").insert({
          id,
          cloudinary_public_id: reservation.cloudinary_public_id,
          secure_url: asset.secureUrl,
          original_filename: reservation.original_filename,
          width: asset.width,
          height: asset.height,
          format: asset.format,
          bytes: asset.bytes,
          caption,
        });
        if (error && error.code !== "23505") throw error;
        await supabase
          .from("photo_upload_reservations")
          .update({ completed_at: new Date().toISOString() })
          .eq("id", id);
        return { id, ok: true };
      } catch (error) {
        try {
          await destroyGuestPhoto(
            reservation.cloudinary_public_id,
            "authenticated",
          );
          await supabase
            .from("photo_upload_reservations")
            .update({ cleaned_at: new Date().toISOString() })
            .eq("id", id);
        } catch (cleanupError) {
          console.error("Guest photo cleanup failed", cleanupError);
        }
        console.error("Guest photo finalization failed", error);
        return { id, ok: false, error: "We couldn't save this photo." };
      }
    }),
  );
  return Response.json(
    { results },
    { status: results.every((item) => item.ok) ? 200 : 207 },
  );
}
