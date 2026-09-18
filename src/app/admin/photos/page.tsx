import Link from "next/link";

import type { AdminPhoto, GuestPhotoStatus } from "@/lib/photos/constants";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { AdminShell } from "../admin-shell";
import { adminStyles } from "../admin-styles";
import { PhotoModeration } from "./photo-moderation";

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
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(24);
  if (status !== "ALL") query = query.eq("status", status);
  const { data, error } = await query.returns<AdminPhoto[]>();
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
        <nav className="mt-10 flex flex-wrap gap-2" aria-label="Photo status">
          {statuses.map((item) => (
            <Link
              key={item}
              href={`/admin/photos?status=${item}`}
              className={`${adminStyles.secondaryButton} ${status === item ? adminStyles.secondaryButtonActive : ""}`}
              aria-current={status === item ? "page" : undefined}
            >
              {item.toLowerCase()}
            </Link>
          ))}
        </nav>
        {error ? (
          <p className={`${adminStyles.formError} mt-8`}>
            The guest-photo migration is unavailable.
          </p>
        ) : (
          <PhotoModeration
            key={status}
            status={status}
            initialPhotos={data ?? []}
          />
        )}
      </section>
    </AdminShell>
  );
}
