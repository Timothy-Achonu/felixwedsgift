import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { logout } from "../actions";
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
  const admin = await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("wedding_settings")
    .select(
      "id, partner_one_name, partner_two_name, wedding_date, timezone, ceremony_time, reception_time, venue_name, venue_address, dress_code, directions_url, hero_eyebrow, hero_message, story_heading, story_introduction, story_body, is_published",
    )
    .eq("id", 1)
    .maybeSingle<SettingsRow>();
  const params = await searchParams;

  return (
    <main className="admin-page">
      <header className="admin-header">
        <Link className="admin-brand" href="/admin" aria-label="Admin overview">
          <span className="admin-brand-monogram font-display">
            F <em>&amp;</em> G
          </span>
          <span className="admin-brand-label">Studio</span>
        </Link>
        <div className="admin-header-actions">
          <span className="admin-user">{admin.email}</span>
          <form action={logout}>
            <button className="admin-logout-button" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="admin-shell">
        <aside className="admin-sidebar" aria-label="Admin navigation">
          <p className="admin-eyebrow">Workspace</p>
          <nav>
            <Link className="admin-nav-link" href="/admin">
              Overview
            </Link>
            <span className="admin-nav-link is-disabled">Photos</span>
            <Link className="admin-nav-link is-active" href="/admin/details">
              Wedding details
            </Link>
            <span className="admin-nav-link is-disabled">Schedule</span>
          </nav>
          <Link className="admin-return-link" href="/">
            <ArrowLeft aria-hidden="true" size={15} />
            Public website
          </Link>
        </aside>

        <section
          className="admin-content admin-form-content"
          aria-labelledby="details-heading"
        >
          <div className="admin-content-intro">
            <p className="admin-eyebrow">Wedding details</p>
            <h1 id="details-heading" className="font-display">
              Shape the day.
            </h1>
            <p>
              These details power the public wedding website described in the
              PRD. Save drafts while you work, then publish when everything is
              ready.
            </p>
          </div>

          {error ? (
            <p className="admin-form-error admin-page-error">
              The settings table is not available yet. Apply the Supabase
              content migration, then reload this page.
            </p>
          ) : (
            <>
              {params.saved === "1" ? (
                <p className="admin-save-confirmation">
                  <CheckCircle2 aria-hidden="true" size={17} /> Wedding details
                  saved.
                </p>
              ) : null}
              <WeddingSettingsForm settings={data} />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
