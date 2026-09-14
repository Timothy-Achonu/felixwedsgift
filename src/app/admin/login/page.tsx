import { redirect } from "next/navigation";
import Link from "next/link";

import { getAdminIdentity } from "@/lib/auth/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

import { adminStyles } from "../admin-styles";
import { AdminLoginForm } from "./login-form";

export default async function AdminLoginPage() {
  if (await getAdminIdentity()) {
    redirect("/admin");
  }

  const configured = isSupabaseConfigured();

  return (
    <main className={adminStyles.authPage}>
      <section
        className={adminStyles.authPanel}
        aria-labelledby="admin-login-heading"
      >
        <p className={adminStyles.mark}>
          F <span className="text-wedding-blue italic">&amp;</span> G
        </p>
        <p className={adminStyles.eyebrow}>Felix &amp; Gift</p>
        <h1 id="admin-login-heading" className={adminStyles.authHeading}>
          Welcome back.
        </h1>
        <p className={adminStyles.authIntro}>
          Sign in to care for the details, schedule, and memories of the day.
        </p>
        {configured ? (
          <AdminLoginForm />
        ) : (
          <div className={adminStyles.setupNotice} role="status">
            <strong>Admin access is not configured yet.</strong>
            <span>
              Add the Supabase URL and publishable key to your local environment
              before signing in.
            </span>
          </div>
        )}
        <Link className={adminStyles.backLink} href="/">
          Return to the wedding website
        </Link>
      </section>
    </main>
  );
}
