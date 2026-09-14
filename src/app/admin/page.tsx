import { adminStyles } from "./admin-styles";
import { AdminShell } from "./admin-shell";
import { CalendarDays, Camera, Settings } from "lucide-react";
import Link from "next/link";

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
          This first shell intentionally shows no sample counts or wedding data.
          Once Supabase content is connected, this overview will reflect the
          live celebration.
        </p>
      </section>
    </AdminShell>
  );
}
