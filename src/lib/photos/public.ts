import "server-only";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { WeddingPhoto } from "@/types/wedding";

type PublicPhotoRow = {
  id: string;
  secure_url: string;
  width: number;
  height: number;
  caption: string | null;
  approved_at: string;
};
export type GalleryCursor = { approvedAt: string; id: string };

function toPhoto(row: PublicPhotoRow): WeddingPhoto {
  return {
    id: row.id,
    src: row.secure_url,
    width: row.width,
    height: row.height,
    caption: row.caption ?? "",
    alt: row.caption || "Wedding photograph from the celebration",
  };
}

export function encodeGalleryCursor(cursor: GalleryCursor) {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

export function decodeGalleryCursor(
  value: string | null,
): GalleryCursor | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString(),
    ) as GalleryCursor;
    return typeof parsed.approvedAt === "string" &&
      /^[0-9a-f-]{36}$/.test(parsed.id)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export async function getApprovedPhotos(
  limit: number,
  cursor: GalleryCursor | null = null,
) {
  if (!isSupabaseConfigured())
    return { photos: [] as WeddingPhoto[], nextCursor: null as string | null };
  const supabase = createSupabasePublicClient();
  let query = supabase
    .from("photos")
    .select("id, secure_url, width, height, caption, approved_at")
    .order("approved_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);
  if (cursor)
    query = query.or(
      `approved_at.lt.${cursor.approvedAt},and(approved_at.eq.${cursor.approvedAt},id.lt.${cursor.id})`,
    );
  const { data, error } = await query.returns<PublicPhotoRow[]>();
  if (error)
    throw new Error("Unable to load the wedding gallery.", { cause: error });
  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const page = rows.slice(0, limit);
  const last = page.at(-1);
  return {
    photos: page.map(toPhoto),
    nextCursor:
      hasMore && last
        ? encodeGalleryCursor({ approvedAt: last.approved_at, id: last.id })
        : null,
  };
}
