import type { PageImageRow } from "@/data/page-images";
import type { AdminPhoto, GuestPhotoStatus } from "@/lib/photos/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

import type { WeddingSettingsFormValues } from "./details/settings-form";
import type { ScheduleItemFormValues } from "./schedule/schedule-form";

export type WeddingSettingsRow = WeddingSettingsFormValues & {
  id: number;
  is_published: boolean;
};

export type AdminScheduleItem = ScheduleItemFormValues & {
  id: string;
  sort_order: number;
};

export type AdminPhotoCursor = {
  createdAt: string;
  id: string;
};

export type AdminPhotoPage = {
  photos: AdminPhoto[];
  nextCursor: AdminPhotoCursor | null;
};

export const adminQueryKeys = {
  all: ["admin"] as const,
  weddingSettings: ["admin", "wedding-settings"] as const,
  schedule: ["admin", "schedule"] as const,
  pageImages: ["admin", "page-images"] as const,
  photos: ["admin", "photos"] as const,
  photoStatus: (status: GuestPhotoStatus | "ALL") =>
    ["admin", "photos", status] as const,
};

export const adminPhotoPageSize = 24;

const settingsColumns =
  "id, partner_one_name, partner_two_name, wedding_date, timezone, ceremony_time, reception_time, venue_name, venue_address, dress_code, directions_url, hero_eyebrow, hero_message, story_heading, story_introduction, story_body, details_heading, is_published";

export async function fetchWeddingSettings() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("wedding_settings")
    .select(settingsColumns)
    .eq("id", 1)
    .maybeSingle<WeddingSettingsRow>();

  if (error) {
    throw new Error(
      "The settings table is unavailable. Apply the Supabase content migration, then retry.",
      { cause: error },
    );
  }
  return data;
}

export async function fetchSchedule() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("schedule_items")
    .select("id, time_label, title, description, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<AdminScheduleItem[]>();

  if (error) {
    throw new Error(
      "The schedule table is unavailable. Apply the Supabase content migration, then retry.",
      { cause: error },
    );
  }
  return data ?? [];
}

export async function fetchPageImages() {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("page_images")
    .select(
      "slot, cloudinary_public_id, secure_url, alt, width, height, focal_x, focal_y",
    )
    .returns<PageImageRow[]>();

  if (error) {
    throw new Error(
      "The page-images table is unavailable. Apply the Supabase migration, then retry.",
      { cause: error },
    );
  }
  return data ?? [];
}

export async function fetchAdminPhotoPage(
  status: GuestPhotoStatus | "ALL",
  cursor: AdminPhotoCursor | null,
): Promise<AdminPhotoPage> {
  const supabase = createSupabaseBrowserClient();
  let query = supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(adminPhotoPageSize + 1);

  if (status !== "ALL") query = query.eq("status", status);
  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
    );
  }

  const { data, error } = await query.returns<AdminPhoto[]>();
  if (error) {
    throw new Error(
      "The guest-photo list is unavailable. Confirm the Supabase migration and try again.",
      { cause: error },
    );
  }

  const rows = data ?? [];
  const hasMore = rows.length > adminPhotoPageSize;
  const photos = rows.slice(0, adminPhotoPageSize);
  const last = photos.at(-1);
  return {
    photos,
    nextCursor:
      hasMore && last ? { createdAt: last.created_at, id: last.id } : null,
  };
}
