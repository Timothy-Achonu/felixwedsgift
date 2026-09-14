"use server";

import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type WeddingSettingsActionState = {
  error?: string;
};

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function saveWeddingSettings(
  _previousState: WeddingSettingsActionState,
  formData: FormData,
): Promise<WeddingSettingsActionState> {
  await requireAdmin();

  const fields = [
    "partner_one_name",
    "partner_two_name",
    "wedding_date",
    "timezone",
    "ceremony_time",
    "reception_time",
    "venue_name",
    "venue_address",
    "dress_code",
    "directions_url",
    "hero_eyebrow",
    "hero_message",
    "story_heading",
    "story_introduction",
    "story_body",
    "details_heading",
  ] as const;

  const values = Object.fromEntries(
    fields.map((field) => [field, String(formData.get(field) ?? "").trim()]),
  );

  const missingField = fields.find((field) => !values[field]);
  if (missingField) {
    return { error: "Please complete every wedding details field." };
  }

  if (Number.isNaN(new Date(values.wedding_date).getTime())) {
    return { error: "Please enter a valid wedding date." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("wedding_settings").upsert(
    {
      id: 1,
      ...values,
      is_published: formData.get("is_published") === "on",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    return {
      error:
        "We could not save the wedding details. Confirm the Supabase migration is applied and try again.",
    };
  }

  redirect("/admin/details?saved=1");
}

type ScheduleActionState = { error?: string };

function scheduleValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export async function saveScheduleItem(
  _previousState: ScheduleActionState,
  formData: FormData,
): Promise<ScheduleActionState> {
  await requireAdmin();

  const title = scheduleValue(formData, "title");
  const timeLabel = scheduleValue(formData, "time_label");
  const description = scheduleValue(formData, "description");
  const id = scheduleValue(formData, "id");
  const sortOrder = Number.parseInt(scheduleValue(formData, "sort_order"), 10);

  if (!title || !timeLabel) {
    return { error: "Add a time and title for this schedule entry." };
  }

  const supabase = await createSupabaseServerClient();
  const payload = {
    time_label: timeLabel,
    title,
    description: description || null,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    updated_at: new Date().toISOString(),
  };
  const query = id
    ? supabase.from("schedule_items").update(payload).eq("id", id)
    : supabase.from("schedule_items").insert(payload);
  const { error } = await query;

  if (error) {
    return { error: "We could not save this schedule entry. Try again." };
  }

  redirect("/admin/schedule?saved=1");
}

export async function deleteScheduleItem(formData: FormData) {
  await requireAdmin();
  const id = scheduleValue(formData, "id");
  if (!id) redirect("/admin/schedule");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("schedule_items").delete().eq("id", id);
  if (error) redirect("/admin/schedule?error=delete");
  redirect("/admin/schedule?deleted=1");
}

export async function moveScheduleItem(formData: FormData) {
  await requireAdmin();
  const id = scheduleValue(formData, "id");
  const direction = scheduleValue(formData, "direction");
  const currentOrder = Number.parseInt(
    scheduleValue(formData, "sort_order"),
    10,
  );
  const adjacentOrder = Number.parseInt(
    scheduleValue(formData, "adjacent_sort_order"),
    10,
  );
  const adjacentId = scheduleValue(formData, "adjacent_id");

  if (
    !id ||
    !adjacentId ||
    !["up", "down"].includes(direction) ||
    !Number.isFinite(currentOrder) ||
    !Number.isFinite(adjacentOrder)
  ) {
    redirect("/admin/schedule");
  }

  const supabase = await createSupabaseServerClient();
  const first = await supabase
    .from("schedule_items")
    .update({ sort_order: adjacentOrder, updated_at: new Date().toISOString() })
    .eq("id", id);
  const second = await supabase
    .from("schedule_items")
    .update({ sort_order: currentOrder, updated_at: new Date().toISOString() })
    .eq("id", adjacentId);

  if (first.error || second.error) redirect("/admin/schedule?error=reorder");
  redirect("/admin/schedule?reordered=1");
}
