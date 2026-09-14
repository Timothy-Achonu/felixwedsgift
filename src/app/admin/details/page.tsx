import { CheckCircle2 } from "lucide-react";

import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { adminStyles } from "../admin-styles";
import { AdminShell } from "../admin-shell";
import {
  WeddingSettingsForm,
  type WeddingSettingsFormValues,
} from "./settings-form";

type SettingsRow = WeddingSettingsFormValues & {
  id: number;
  is_published: boolean;
};

export default async function WeddingDetailsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("wedding_settings")
    .select(
      "id, partner_one_name, partner_two_name, wedding_date, timezone, ceremony_time, reception_time, venue_name, venue_address, dress_code, directions_url, hero_eyebrow, hero_message, story_heading, story_introduction, story_body, details_heading, is_published",
    )
    .eq("id", 1)
    .maybeSingle<SettingsRow>();
  const params = await searchParams;

  return (
    <AdminShell activeSection="details">
      <section
        className={`${adminStyles.content} ${adminStyles.formContent}`}
        aria-labelledby="details-heading"
      >
        <div className={adminStyles.contentIntro}>
          <p className={adminStyles.eyebrow}>Wedding details</p>
          <h1 id="details-heading" className={adminStyles.contentHeading}>
            Shape the day.
          </h1>
          <p className={adminStyles.contentCopy}>
            These details power the public wedding website described in the PRD.
            Save drafts while you work, then publish when everything is ready.
          </p>
        </div>

        {error ? (
          <p className={`${adminStyles.formError} ${adminStyles.pageError}`}>
            The settings table is not available yet. Apply the Supabase content
            migration, then reload this page.
          </p>
        ) : (
          <>
            {params.saved === "1" ? (
              <p className={adminStyles.saveConfirmation}>
                <CheckCircle2 aria-hidden="true" size={17} /> Wedding details
                saved.
              </p>
            ) : null}
            <WeddingSettingsForm settings={data} />
          </>
        )}
      </section>
    </AdminShell>
  );
}
