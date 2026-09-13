import { ArrowLeft, CalendarDays, Camera, Settings } from "lucide-react";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth/admin";

import { logout } from "./actions";

const upcomingModules = [
  {
    icon: Settings,
    label: "Wedding settings",
    description: "Names, date, venue, story, and details.",
  },
  {
    icon: CalendarDays,
    label: "Schedule",
    description: "Shape the order of joy for the celebration.",
  },
  {
    icon: Camera,
    label: "Photo moderation",
    description: "Review and curate guest photographs.",
  },
];

export default async function AdminPage() {
  const admin = await requireAdmin();

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
            <Link className="admin-nav-link is-active" href="/admin">
              Overview
            </Link>
            <span className="admin-nav-link is-disabled">Photos</span>
            <Link className="admin-nav-link" href="/admin/details">
              Wedding details
            </Link>
            <span className="admin-nav-link is-disabled">Schedule</span>
          </nav>
          <Link className="admin-return-link" href="/">
            <ArrowLeft aria-hidden="true" size={15} />
            Public website
          </Link>
        </aside>

        <section className="admin-content" aria-labelledby="admin-heading">
          <div className="admin-content-intro">
            <p className="admin-eyebrow">The Felix &amp; Gift workspace</p>
            <h1 id="admin-heading" className="font-display">
              A beautiful day,
              <br />
              thoughtfully held.
            </h1>
            <p>
              Your workspace is ready. The next steps will connect the wedding
              details, schedule, and guest memories to this home.
            </p>
          </div>

          <div className="admin-module-grid">
            {upcomingModules.map(({ icon: Icon, label, description }) => (
              <article className="admin-module-card" key={label}>
                <Icon aria-hidden="true" size={22} strokeWidth={1.5} />
                <p className="admin-eyebrow">Coming next</p>
                <h2 className="font-display">{label}</h2>
                <p>{description}</p>
                {label === "Wedding settings" ? (
                  <Link className="admin-card-link" href="/admin/details">
                    Edit wedding details
                  </Link>
                ) : null}
              </article>
            ))}
          </div>

          <p className="admin-honesty-note">
            This first shell intentionally shows no sample counts or wedding
            data. Once Supabase content is connected, this overview will reflect
            the live celebration.
          </p>
        </section>
      </div>
    </main>
  );
}
