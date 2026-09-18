import { createHmac, randomUUID } from "node:crypto";

import { cookies } from "next/headers";

import { env } from "@/env";
import {
  guestPhotoMimeTypes,
  maximumGuestPhotoBatch,
  maximumGuestPhotoBytes,
} from "@/lib/photos/constants";
import {
  destroyGuestPhoto,
  signGuestPhotoUpload,
} from "@/lib/photos/cloudinary";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type FileRequest = {
  id?: unknown;
  name?: unknown;
  size?: unknown;
  type?: unknown;
};

function digest(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

async function cleanupExpiredReservations(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
) {
  const { data } = await supabase
    .from("photo_upload_reservations")
    .select("id, cloudinary_public_id")
    .is("completed_at", null)
    .is("cleaned_at", null)
    .lt("expires_at", new Date().toISOString())
    .limit(10);
  await Promise.allSettled(
    (data ?? []).map(async (reservation) => {
      await destroyGuestPhoto(
        reservation.cloudinary_public_id,
        "authenticated",
      );
      await supabase
        .from("photo_upload_reservations")
        .update({ cleaned_at: new Date().toISOString() })
        .eq("id", reservation.id)
        .is("completed_at", null);
    }),
  );
}

export async function POST(request: Request) {
  const secret = env.UPLOAD_RATE_LIMIT_SECRET;
  if (!secret || !env.SUPABASE_SECRET_KEY) {
    return Response.json(
      { error: "Photo sharing is not configured yet." },
      { status: 503 },
    );
  }
  let input: { batchId?: unknown; files?: unknown };
  try {
    input = (await request.json()) as typeof input;
  } catch {
    return Response.json({ error: "Invalid upload request." }, { status: 400 });
  }
  if (
    typeof input.batchId !== "string" ||
    !/^[0-9a-f-]{36}$/.test(input.batchId) ||
    !Array.isArray(input.files) ||
    input.files.length < 1 ||
    input.files.length > maximumGuestPhotoBatch
  ) {
    return Response.json(
      { error: `Choose between 1 and ${maximumGuestPhotoBatch} photos.` },
      { status: 400 },
    );
  }
  const files = input.files as FileRequest[];
  const fileIds = files.map(({ id }) => id);
  if (
    new Set(fileIds).size !== fileIds.length ||
    files.some(
      (file) =>
        typeof file.id !== "string" ||
        !/^[0-9a-f-]{36}$/.test(file.id) ||
        typeof file.name !== "string" ||
        !file.name.trim() ||
        file.name.length > 255 ||
        typeof file.size !== "number" ||
        !Number.isInteger(file.size) ||
        file.size < 1 ||
        file.size > maximumGuestPhotoBytes ||
        typeof file.type !== "string" ||
        !guestPhotoMimeTypes.includes(
          file.type as (typeof guestPhotoMimeTypes)[number],
        ),
    )
  ) {
    return Response.json(
      { error: "Choose valid JPEG, PNG, or WebP photos no larger than 10 MB." },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const deviceToken =
    cookieStore.get("wedding-upload-device")?.value ?? randomUUID();
  const deviceHash = digest(deviceToken, secret);
  const address =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null;
  const ipHash = address ? digest(address, secret) : null;
  const reservationFiles = files.map((file) => ({
    id: file.id as string,
    public_id: `wedding/guest/${file.id as string}`,
    name: (file.name as string).trim(),
    mime_type: file.type as string,
    bytes: file.size as number,
  }));

  const supabase = createSupabaseAdminClient();
  await cleanupExpiredReservations(supabase);
  const { data, error } = await supabase.rpc("reserve_photo_uploads", {
    p_batch_id: input.batchId,
    p_device_hash: deviceHash,
    p_ip_hash: ipHash,
    p_files: reservationFiles,
  });
  if (error || !Array.isArray(data)) {
    const limited = /rate_limit|capacity_reached/.test(error?.message ?? "");
    return Response.json(
      {
        error: limited
          ? "Photo sharing is busy right now. Please try again later."
          : "We couldn't prepare those photos. Please try again.",
      },
      {
        status: limited ? 429 : 500,
        headers: limited ? { "Retry-After": "3600" } : undefined,
      },
    );
  }
  cookieStore.set("wedding-upload-device", deviceToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  const byId = new Map(
    (data as Array<{ id: string; publicId: string; expiresAt: string }>).map(
      (item) => [item.id, item],
    ),
  );
  return Response.json({
    uploads: files.map((file) => {
      const reservation = byId.get(file.id as string);
      if (!reservation) throw new Error("Reservation response was incomplete.");
      return {
        id: reservation.id,
        expiresAt: reservation.expiresAt,
        ...signGuestPhotoUpload(reservation.publicId),
      };
    }),
  });
}
