import { requireAdmin } from "@/lib/auth/admin";

import { adminStyles } from "../admin-styles";
import { AdminShell } from "../admin-shell";
import { DetailsContent } from "./details-content";

export default async function WeddingDetailsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();
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

        <DetailsContent saved={params.saved === "1"} />
      </section>
    </AdminShell>
  );
}
