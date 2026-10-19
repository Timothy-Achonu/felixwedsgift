import { env } from "@/env";
import { mockWeddingContent } from "@/data/mock-wedding";
import type { PageImageSlot } from "@/data/page-images";
import { requireAdmin } from "@/lib/auth/admin";
import type { WeddingPhoto } from "@/types/wedding";

import { AdminShell } from "../admin-shell";
import { adminStyles } from "../admin-styles";
import { PageImagesContent } from "./page-images-content";

const fallbacks: Record<PageImageSlot, WeddingPhoto> = {
  hero_desktop: mockWeddingContent.hero.image,
  hero_mobile: mockWeddingContent.hero.mobileImage,
  story_primary: mockWeddingContent.story.images[0],
  story_inset: mockWeddingContent.story.images[1],
  venue: mockWeddingContent.details.image,
};

export default async function PageImagesPage() {
  await requireAdmin();
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
        <PageImagesContent configured={configured} fallbacks={fallbacks} />
      </section>
    </AdminShell>
  );
}
