import { revalidatePath } from "next/cache";

import { isPageImageSlot } from "@/data/page-images";
import { getAdminIdentity } from "@/lib/auth/admin";
import {
  destroyPageImage,
  verifyPageImage,
} from "@/lib/cloudinary/page-images";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SaveRequest = {
  slot?: unknown;
  publicId?: unknown;
  expectedPublicId?: unknown;
  alt?: unknown;
  focalX?: unknown;
  focalY?: unknown;
};

function validPosition(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 1
  );
}

export async function POST(request: Request) {
  if (!(await getAdminIdentity())) {
    return Response.json(
      { error: "Admin authorization required." },
      { status: 403 },
    );
  }

  let input: SaveRequest;
  try {
    input = (await request.json()) as SaveRequest;
  } catch {
    return Response.json({ error: "Invalid image request." }, { status: 400 });
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return Response.json({ error: "Invalid image request." }, { status: 400 });
  }
  const { slot, publicId, expectedPublicId, alt, focalX, focalY } = input;
  if (
    typeof slot !== "string" ||
    !isPageImageSlot(slot) ||
    typeof publicId !== "string" ||
    typeof expectedPublicId !== "string" ||
    typeof alt !== "string" ||
    !alt.trim() ||
    alt.trim().length > 180 ||
    !validPosition(focalX) ||
    !validPosition(focalY)
  ) {
    return Response.json(
      { error: "Complete the image description and framing." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: previous, error: readError } = await supabase
    .from("page_images")
    .select("cloudinary_public_id, secure_url, width, height")
    .eq("slot", slot)
    .maybeSingle();
  if (readError) {
    return Response.json(
      { error: "The page-images migration is not applied." },
      { status: 503 },
    );
  }
  if ((previous?.cloudinary_public_id ?? "") !== expectedPublicId) {
    return Response.json(
      {
        error:
          "This image changed in another admin session. Reload and try again.",
      },
      { status: 409 },
    );
  }

  if (slot === "hero_mobile") {
    const { data: desktopHero, error: desktopError } = await supabase
      .from("page_images")
      .select("alt")
      .eq("slot", "hero_desktop")
      .maybeSingle();
    if (desktopError || !desktopHero || desktopHero.alt !== alt.trim()) {
      return Response.json(
        {
          error:
            "Save or reload the desktop hero's shared description before the phone crop.",
        },
        { status: 409 },
      );
    }
  }

  let asset;
  try {
    asset =
      publicId === expectedPublicId && previous
        ? {
            publicId,
            secureUrl: previous.secure_url,
            width: previous.width,
            height: previous.height,
          }
        : await verifyPageImage(publicId);
  } catch {
    return Response.json(
      { error: "The Cloudinary image could not be verified." },
      { status: 400 },
    );
  }
  if (
    (slot === "hero_desktop" &&
      (asset.width !== 1600 || asset.height !== 900)) ||
    (slot === "hero_mobile" && (asset.width !== 900 || asset.height !== 1600))
  ) {
    return Response.json(
      {
        error:
          "The hero crop does not match this screen's required ratio and resolution.",
      },
      { status: 400 },
    );
  }

  const payload = {
    slot,
    cloudinary_public_id: asset.publicId,
    secure_url: asset.secureUrl,
    alt: alt.trim(),
    width: asset.width,
    height: asset.height,
    focal_x: focalX,
    focal_y: focalY,
    updated_at: new Date().toISOString(),
  };
  const result = previous
    ? await supabase
        .from("page_images")
        .update(payload)
        .eq("slot", slot)
        .eq("cloudinary_public_id", expectedPublicId)
        .select("slot")
        .maybeSingle()
    : await supabase
        .from("page_images")
        .insert(payload)
        .select("slot")
        .maybeSingle();

  if (result.error || !result.data) {
    if (publicId !== expectedPublicId) {
      try {
        await destroyPageImage(publicId);
      } catch (error) {
        console.error("Page-image rollback failed", error);
      }
    }
    return Response.json(
      { error: "The image was not saved. Reload and try again." },
      { status: 409 },
    );
  }

  revalidatePath("/");
  revalidatePath("/admin/page-images");
  if (previous && previous.cloudinary_public_id !== publicId) {
    try {
      await destroyPageImage(previous.cloudinary_public_id);
    } catch (error) {
      console.error("Page-image cleanup failed", error);
    }
  }
  return Response.json({ image: payload });
}

export async function DELETE(request: Request) {
  if (!(await getAdminIdentity())) {
    return Response.json(
      { error: "Admin authorization required." },
      { status: 403 },
    );
  }
  let publicId: unknown;
  try {
    ({ publicId } = await request.json());
  } catch {
    return Response.json({ error: "Invalid image request." }, { status: 400 });
  }
  if (
    typeof publicId !== "string" ||
    !/^wedding\/page\/[0-9a-f-]{36}$/.test(publicId)
  ) {
    return Response.json({ error: "Invalid image asset." }, { status: 400 });
  }
  const supabase = await createSupabaseServerClient();
  const { data: inUse, error } = await supabase
    .from("page_images")
    .select("slot")
    .eq("cloudinary_public_id", publicId)
    .limit(1);
  if (error || inUse?.length) {
    return Response.json(
      { error: "This image is still in use or could not be checked." },
      { status: 409 },
    );
  }
  try {
    await destroyPageImage(publicId);
    return Response.json({ removed: true });
  } catch {
    return Response.json(
      { error: "Cloudinary could not remove the unused asset." },
      { status: 502 },
    );
  }
}
