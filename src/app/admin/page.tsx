import { adminStyles } from "./admin-styles";
import { AdminShell } from "./admin-shell";
import { CalendarDays, Camera, Settings } from "lucide-react";
import Link from "next/link";

const overviewModules = [
  {
    icon: Settings,
    label: "Wedding settings",
    status: "Available now",
    description: "Names, date, venue, story, and details.",
    href: "/admin/details",
    actionLabel: "Edit wedding details",
  },
  {
    icon: CalendarDays,
    label: "Schedule",
    status: "Available now",
    description: "Shape the order of joy for the celebration.",
    href: "/admin/schedule",
    actionLabel: "Open schedule",
  },
  {
    icon: Camera,
    label: "Photo moderation",
    status: "Available now",
    description: "Review and curate guest photographs.",
    href: "/admin/photos",
    actionLabel: "Review photographs",
  },
];

export default async function AdminPage() {
  return (
    <AdminShell activeSection="overview">
      <section className={adminStyles.content} aria-labelledby="admin-heading">
        <div className={adminStyles.contentIntro}>
          <p className={adminStyles.eyebrow}>The Felix &amp; Gift workspace</p>
          <h1 id="admin-heading" className={adminStyles.contentHeading}>
            A beautiful day,
            <br />
            thoughtfully held.
          </h1>
          <p className={adminStyles.contentCopy}>
            Your workspace is ready. Manage the wedding details and schedule
            here, including guest photo review and approval.
          </p>
        </div>

        <div className={adminStyles.moduleGrid}>
          {overviewModules.map(
            ({ icon: Icon, label, status, description, href, actionLabel }) => (
              <article className={adminStyles.moduleCard} key={label}>
                <Icon aria-hidden="true" size={22} strokeWidth={1.5} />
                <p className={adminStyles.eyebrow}>{status}</p>
                <h2 className={adminStyles.moduleHeading}>{label}</h2>
                <p>{description}</p>
                {href && actionLabel ? (
                  <Link className={adminStyles.cardLink} href={href}>
                    {actionLabel}
                  </Link>
                ) : null}
              </article>
            ),
          )}
        </div>

        <p className={adminStyles.honestyNote}>
          This overview does not show live counts yet. Once Supabase content is
          connected, it will reflect the live celebration.
        </p>
      </section>
    </AdminShell>
  );
}
