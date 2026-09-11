import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/wedding/site-header";
import { WeddingGallery } from "@/components/wedding/wedding-gallery";
import { getWeddingContent } from "@/data/mock-wedding";

export const metadata: Metadata = {
  title: "Wedding Gallery | Felix & Gift",
  description: "Photographs from Felix and Gift's wedding celebration.",
};

export default async function GalleryPage() {
  const wedding = await getWeddingContent();

  return (
    <main className="gallery-page">
      <section
        className="gallery-page-hero"
        aria-labelledby="gallery-page-heading"
      >
        <SiteHeader />
        <div className="section-shell gallery-page-intro">
          <p className="eyebrow">The wedding album</p>
          <h1 id="gallery-page-heading" className="font-display">
            Every moment, together.
          </h1>
          <div className="gallery-page-meta">
            <p>
              The promises, the happy tears, and all the joy in between—held
              here for us to return to.
            </p>
            <span aria-label={`${wedding.gallery.length} photographs`}>
              {String(wedding.gallery.length).padStart(2, "0")} photographs
            </span>
          </div>
        </div>
      </section>

      <section aria-label="Wedding photographs" className="gallery-page-wall">
        <WeddingGallery photos={wedding.gallery} variant="wall" />
      </section>

      <footer className="gallery-page-footer">
        <div className="section-shell">
          <p className="font-display">F &amp; G</p>
          <Link href="/" className="focus-ring">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to the celebration
          </Link>
        </div>
      </footer>
    </main>
  );
}
