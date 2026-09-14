import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { logout } from "../actions";
import { adminStyles } from "../admin-styles";
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
    <main className={adminStyles.page}>
      <header className={adminStyles.header}>
        <Link
          className={adminStyles.brand}
          href="/admin"
          aria-label="Admin overview"
        >
          <span className={adminStyles.brandMonogram}>
            F <em className="text-wedding-blue">&amp;</em> G
          </span>
          <span className={adminStyles.brandLabel}>Studio</span>
        </Link>
        <div className={adminStyles.headerActions}>
          <span className={adminStyles.user}>{admin.email}</span>
          <form action={logout}>
            <button className={adminStyles.logoutButton} type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className={adminStyles.shell}>
        <aside className={adminStyles.sidebar} aria-label="Admin navigation">
          <p className={adminStyles.eyebrow}>Workspace</p>
          <nav className={adminStyles.sidebarNav}>
            <Link className={adminStyles.navLink} href="/admin">
              Overview
            </Link>
            <span
              className={`${adminStyles.navLink} ${adminStyles.navDisabled}`}
            >
              Photos
            </span>
            <Link
              className={`${adminStyles.navLink} ${adminStyles.navActive}`}
              href="/admin/details"
            >
              Wedding details
            </Link>
            <span
              className={`${adminStyles.navLink} ${adminStyles.navDisabled}`}
            >
              Schedule
            </span>
          </nav>
          <Link className={adminStyles.returnLink} href="/">
            <ArrowLeft aria-hidden="true" size={15} />
            Public website
          </Link>
        </aside>

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
              These details power the public wedding website described in the
              PRD. Save drafts while you work, then publish when everything is
              ready.
            </p>
          </div>

          {error ? (
            <p className={`${adminStyles.formError} ${adminStyles.pageError}`}>
              The settings table is not available yet. Apply the Supabase
              content migration, then reload this page.
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
      </div>
    </main>
  );
}
