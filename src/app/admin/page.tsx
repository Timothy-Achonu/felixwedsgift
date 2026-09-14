import { ArrowLeft, CalendarDays, Camera, Settings } from "lucide-react";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth/admin";

import { logout } from "./actions";
import { adminStyles } from "./admin-styles";

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
            <Link
              className={`${adminStyles.navLink} ${adminStyles.navActive}`}
              href="/admin"
            >
              Overview
            </Link>
            <span
              className={`${adminStyles.navLink} ${adminStyles.navDisabled}`}
            >
              Photos
            </span>
            <Link className={adminStyles.navLink} href="/admin/details">
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
          className={adminStyles.content}
          aria-labelledby="admin-heading"
        >
          <div className={adminStyles.contentIntro}>
            <p className={adminStyles.eyebrow}>
              The Felix &amp; Gift workspace
            </p>
            <h1 id="admin-heading" className={adminStyles.contentHeading}>
              A beautiful day,
              <br />
              thoughtfully held.
            </h1>
            <p className={adminStyles.contentCopy}>
              Your workspace is ready. The next steps will connect the wedding
              details, schedule, and guest memories to this home.
            </p>
          </div>

          <div className={adminStyles.moduleGrid}>
            {upcomingModules.map(({ icon: Icon, label, description }) => (
              <article className={adminStyles.moduleCard} key={label}>
                <Icon aria-hidden="true" size={22} strokeWidth={1.5} />
                <p className={adminStyles.eyebrow}>Coming next</p>
                <h2 className={adminStyles.moduleHeading}>{label}</h2>
                <p>{description}</p>
                {label === "Wedding settings" ? (
                  <Link className={adminStyles.cardLink} href="/admin/details">
                    Edit wedding details
                  </Link>
                ) : null}
              </article>
            ))}
          </div>

          <p className={adminStyles.honestyNote}>
            This first shell intentionally shows no sample counts or wedding
            data. Once Supabase content is connected, this overview will reflect
            the live celebration.
          </p>
        </section>
      </div>
    </main>
  );
}
