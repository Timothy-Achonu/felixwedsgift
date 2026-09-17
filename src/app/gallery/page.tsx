import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/wedding/site-header";
import { GalleryWall } from "@/components/wedding/gallery-wall";
import { getWeddingContent } from "@/data/wedding";
import { getApprovedPhotos } from "@/lib/photos/public";
import { getPublicWeddingMetadata } from "@/lib/wedding/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const wedding = await getWeddingContent();

  return getPublicWeddingMetadata(wedding, "gallery");
}

export default async function GalleryPage() {
  const wedding = await getWeddingContent();
  const gallery = wedding.isMock
    ? { photos: wedding.gallery, nextCursor: null }
    : await getApprovedPhotos(24);

  return (
    <main className="bg-wedding-paper min-h-screen">
      <section
        className="bg-wedding-navy text-wedding-cream after:border-wedding-blue/40 relative overflow-hidden pt-40 pb-18 after:absolute after:-right-32 after:-bottom-64 after:size-[30rem] after:rounded-full after:border after:content-['']"
        aria-labelledby="gallery-page-heading"
      >
        <SiteHeader />
        <div className="section-shell relative z-1">
          <p className="eyebrow">The wedding album</p>
          <h1
            id="gallery-page-heading"
            className="wedding-display mt-3 mb-10 max-w-[10ch] text-[clamp(4rem,13vw,9rem)] leading-[0.82] font-medium tracking-[-0.04em]"
          >
            Every moment, together.
          </h1>
          <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
            <p className="text-wedding-cream/72 m-0 max-w-[36rem] text-[0.9rem] leading-[1.75]">
              The promises, the happy tears, and all the joy in between—held
              here for us to return to.
            </p>
            <span
              className="text-wedding-blue text-[0.7rem] font-[750] uppercase"
              aria-label={
                wedding.isMock
                  ? `${gallery.photos.length} photographs`
                  : "Admin-approved wedding photographs"
              }
            >
              {wedding.isMock
                ? `${String(gallery.photos.length).padStart(2, "0")} photographs`
                : "Approved photographs"}
            </span>
          </div>
        </div>
      </section>

      <section aria-label="Wedding photographs" className="min-h-80">
        <GalleryWall
          initialPhotos={gallery.photos}
          initialCursor={gallery.nextCursor}
        />
      </section>

      <footer className="bg-wedding-brown text-wedding-cream py-10">
        <div className="section-shell flex items-center justify-between gap-8">
          <p className="wedding-display m-0 text-[2rem] italic">F &amp; G</p>
          <Link
            href="/"
            className="focus-ring inline-flex items-center gap-2 text-[0.72rem] font-[750] text-inherit uppercase no-underline"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to the celebration
          </Link>
        </div>
      </footer>
    </main>
  );
}
