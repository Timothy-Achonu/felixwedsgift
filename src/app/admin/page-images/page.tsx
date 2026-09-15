import { env } from "@/env";
import { mockWeddingContent } from "@/data/mock-wedding";
import {
  pageImageSlots,
  type PageImageRow,
  type PageImageSlot,
} from "@/data/page-images";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { WeddingPhoto } from "@/types/wedding";

import { AdminShell } from "../admin-shell";
import { adminStyles } from "../admin-styles";
import { PageImageEditor } from "./page-image-editor";

const fallbacks: Record<PageImageSlot, WeddingPhoto> = {
  hero_desktop: mockWeddingContent.hero.image,
  hero_mobile: mockWeddingContent.hero.mobileImage,
  story_primary: mockWeddingContent.story.images[0],
  story_inset: mockWeddingContent.story.images[1],
  venue: mockWeddingContent.details.image,
};

export default async function PageImagesPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("page_images")
    .select(
      "slot, cloudinary_public_id, secure_url, alt, width, height, focal_x, focal_y",
    )
    .returns<PageImageRow[]>();
  const images = new Map((data ?? []).map((row) => [row.slot, row]));
  const configured = Boolean(
    env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET,
  );

  return (
    <AdminShell activeSection="page-images">
      <section
        className={`${adminStyles.content} ${adminStyles.formContent}`}
        aria-labelledby="page-images-heading"
      >
        <div className={adminStyles.contentIntro}>
          <p className={adminStyles.eyebrow}>Page photography</p>
          <h1 id="page-images-heading" className={adminStyles.contentHeading}>
            Frame the invitation.
          </h1>
          <p className={adminStyles.contentCopy}>
            Replace the hero, story and venue photographs. These are page
            images, not guest-gallery uploads. Changes to published settings
            appear as soon as each image is saved.
          </p>
        </div>
        {error ? (
          <p className={`${adminStyles.formError} ${adminStyles.pageError}`}>
            The page-images table is unavailable. Apply the new Supabase
            migration before editing.
          </p>
        ) : !configured ? (
          <p className={`${adminStyles.formError} ${adminStyles.pageError}`}>
            Set the Cloudinary cloud name, API key and API secret before
            uploading page images.
          </p>
        ) : (
          <PageImageEditor
            entries={pageImageSlots.map((slot) => ({
              slot,
              image: images.get(slot) ?? null,
              fallback: fallbacks[slot],
            }))}
          />
        )}
      </section>
    </AdminShell>
  );
}
