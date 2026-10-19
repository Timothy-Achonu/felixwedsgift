import type { GuestPhotoStatus } from "@/lib/photos/constants";
import { requireAdmin } from "@/lib/auth/admin";

import { AdminShell } from "../admin-shell";
import { adminStyles } from "../admin-styles";
import { PhotoModerationContent } from "./photo-moderation-content";

const statuses = ["PENDING", "APPROVED", "REJECTED", "ALL"] as const;

export default async function PhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const requested = (await searchParams).status?.toUpperCase();
  const status = statuses.includes(requested as (typeof statuses)[number])
    ? (requested as GuestPhotoStatus | "ALL")
    : "PENDING";
  return (
    <AdminShell activeSection="photos">
      <section className={adminStyles.content} aria-labelledby="photos-heading">
        <div className={adminStyles.contentIntro}>
          <p className={adminStyles.eyebrow}>Guest photographs</p>
          <h1 id="photos-heading" className={adminStyles.contentHeading}>
            Review every memory.
          </h1>
          <p className={adminStyles.contentCopy}>
            Approve photographs for the public album, keep them private, or
            remove them permanently.
          </p>
        </div>
        <PhotoModerationContent initialStatus={status} />
      </section>
    </AdminShell>
  );
}
