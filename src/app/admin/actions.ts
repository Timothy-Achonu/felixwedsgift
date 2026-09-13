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
