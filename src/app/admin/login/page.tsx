import { redirect } from "next/navigation";
import Link from "next/link";

import { getAdminIdentity } from "@/lib/auth/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

import { AdminLoginForm } from "./login-form";

export default async function AdminLoginPage() {
  if (await getAdminIdentity()) {
    redirect("/admin");
  }

  const configured = isSupabaseConfigured();

  return (
    <main className="admin-auth-page">
      <section
        className="admin-auth-panel"
        aria-labelledby="admin-login-heading"
      >
        <p className="admin-mark font-display">
          F <span>&amp;</span> G
        </p>
        <p className="admin-eyebrow">Felix &amp; Gift</p>
        <h1 id="admin-login-heading" className="font-display">
          Welcome back.
        </h1>
        <p className="admin-auth-intro">
          Sign in to care for the details, schedule, and memories of the day.
        </p>
        {configured ? (
          <AdminLoginForm />
        ) : (
          <div className="admin-setup-notice" role="status">
            <strong>Admin access is not configured yet.</strong>
            <span>
              Add the Supabase URL and publishable key to your local environment
              before signing in.
            </span>
          </div>
        )}
        <Link className="admin-back-link" href="/">
          Return to the wedding website
        </Link>
      </section>
    </main>
  );
}
