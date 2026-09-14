import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Camera,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { WeddingCountdown } from "@/components/wedding/countdown";
import { PhotoUploadDemo } from "@/components/wedding/photo-upload-demo";
import { Reveal } from "@/components/wedding/reveal";
import { SiteHeader } from "@/components/wedding/site-header";
import { WeddingGallery } from "@/components/wedding/wedding-gallery";
import { getWeddingContent } from "@/data/wedding";

export default async function Home() {
  const wedding = await getWeddingContent();
  const coupleName = `${wedding.couple.partnerOne} & ${wedding.couple.partnerTwo}`;

  return (
    <main id="home">
      <section
        className="bg-wedding-navy text-wedding-cream relative max-h-[980px] min-h-[92svh] overflow-hidden"
        aria-labelledby="wedding-heading"
      >
        <SiteHeader />
        <Image
          src={wedding.hero.image.src}
          alt={wedding.hero.image.alt}
          fill
          priority
          sizes="100vw"
          className="animate-[hero-image-in_1.4s_cubic-bezier(0.2,0.7,0.2,1)_both] object-cover object-[58%_center]"
        />
        <div
          className="bg-wedding-navy/[42%] absolute inset-0 z-1"
          aria-hidden="true"
        />

        <div className="absolute bottom-[6.5rem] left-5 z-2 w-[min(calc(100%-2.5rem),920px)] sm:left-8 sm:w-[min(calc(100%-4rem),1000px)] md:bottom-20 lg:left-[max(3rem,calc((100vw-1344px)/2))]">
          <p className="m-0 mb-4 animate-[hero-copy-in_720ms_cubic-bezier(0.2,0.7,0.2,1)_both] text-xs font-[750] uppercase">
            {wedding.hero.eyebrow}
          </p>
          <h1
            id="wedding-heading"
            aria-label={coupleName}
            className="wedding-display m-0 flex flex-wrap items-baseline gap-x-[0.42em] text-[4.5rem] leading-[0.8] font-medium tracking-[-0.03em] sm:text-[6.8rem] md:text-[8rem] lg:text-[9.5rem] [&>span]:block"
          >
            <span className="animate-[hero-copy-in_720ms_cubic-bezier(0.2,0.7,0.2,1)_both] [animation-delay:120ms]">
              {wedding.couple.partnerOne}
            </span>
            <span className="text-wedding-blue animate-[hero-copy-in_720ms_cubic-bezier(0.2,0.7,0.2,1)_both] text-[0.62em] italic [animation-delay:230ms]">
              &amp;
            </span>
            <span className="animate-[hero-copy-in_720ms_cubic-bezier(0.2,0.7,0.2,1)_both] [animation-delay:340ms]">
              {wedding.couple.partnerTwo}
            </span>
          </h1>

          <div className="[&>span]:bg-wedding-cream mt-7 flex animate-[hero-copy-in_720ms_cubic-bezier(0.2,0.7,0.2,1)_both] flex-wrap items-center gap-3 text-[0.73rem] font-bold uppercase [animation-delay:480ms] sm:gap-4 lg:mt-9 [&_p]:m-0 [&>span]:h-px [&>span]:w-6 [&>span]:opacity-66">
            <p>{wedding.hero.message}</p>
            <span aria-hidden="true" />
            <time dateTime={wedding.weddingDate}>
              {wedding.weddingDateLabel}
            </time>
            <span aria-hidden="true" />
            <p>{wedding.details.venueAddress}</p>
          </div>
        </div>

        <a
          className="focus-ring absolute right-5 bottom-6 z-3 inline-flex items-center gap-2 text-[0.72rem] font-[750] text-inherit uppercase no-underline"
          href="#countdown"
        >
          <span>Begin</span>
          <ArrowDown aria-hidden="true" className="size-4" />
        </a>
      </section>

      <section
        id="countdown"
        className="section-anchor bg-wedding-blue text-wedding-navy grid gap-10 px-5 py-18 sm:px-8 md:grid-cols-[minmax(15rem,0.8fr)_minmax(28rem,1.6fr)] md:items-end md:px-[max(2rem,calc((100vw-1240px)/2))] md:py-20"
      >
        <Reveal>
          <p className="eyebrow">Until we say I do</p>
          <h2 className="wedding-display mt-[0.6rem] max-w-[10ch] text-[2.7rem] leading-[0.98] font-medium md:text-[3.3rem]">
            The celebration begins in
          </h2>
        </Reveal>
        <WeddingCountdown
          weddingDate={wedding.weddingDate}
          timezone={wedding.timezone}
          weddingDateLabel={wedding.weddingDateLabel}
        />
      </section>

      <section
        id="story"
        className="section-anchor bg-wedding-paper overflow-hidden pt-26 pb-28 lg:pt-34 lg:pb-36"
        aria-labelledby="story-heading"
      >
        <div className="section-shell grid gap-16 md:grid-cols-[minmax(18rem,0.85fr)_minmax(26rem,1.15fr)] md:items-center">
          <Reveal className="self-center">
            <p className="eyebrow">Our story</p>
            <h2
              id="story-heading"
              className="section-title wedding-display mt-4 max-w-[10ch]"
            >
              {wedding.story.heading}
            </h2>
            <p className="text-wedding-brown mt-8 mb-4 max-w-[33rem] text-[1.15rem] leading-[1.65] font-[650]">
              {wedding.story.introduction}
            </p>
            <p className="text-wedding-brown/80 m-0 max-w-[36rem] text-[0.98rem] leading-[1.85]">
              {wedding.story.body}
            </p>
            <p className="wedding-display text-wedding-blue mt-8 text-[1.9rem] italic">
              Felix &amp; Gift
            </p>
          </Reveal>

          <Reveal
            className="relative min-h-[34rem] md:min-h-[43rem]"
            delay="short"
          >
            <figure className="bg-wedding-mist absolute inset-[0_3.8rem_4.5rem_0] m-0 overflow-hidden md:inset-[0_5rem_5rem_0] [&_img]:object-cover">
              <Image
                src={wedding.story.images[0].src}
                alt={wedding.story.images[0].alt}
                fill
                sizes="(max-width: 768px) 78vw, 40vw"
              />
            </figure>
            <figure className="border-wedding-paper bg-wedding-mist absolute right-0 bottom-0 m-0 aspect-4/3 w-[48%] overflow-hidden border-[0.6rem] [&_img]:object-cover">
              <Image
                src={wedding.story.images[1].src}
                alt={wedding.story.images[1].alt}
                fill
                sizes="(max-width: 768px) 54vw, 22vw"
              />
            </figure>
            <p className="font-display text-wedding-brown absolute top-4 -right-4 m-0 text-[1.15rem] italic [writing-mode:vertical-rl]">
              One promise, made together
            </p>
          </Reveal>
        </div>
      </section>

      <section
        id="details"
        className="section-anchor bg-wedding-cream py-24 lg:py-32"
        aria-labelledby="details-heading"
      >
        <div className="section-shell">
          <Reveal className="border-wedding-brown/[34%] border-b pb-12 text-center">
            <p className="eyebrow">Save the date</p>
            <h2
              id="details-heading"
              className="section-title wedding-display mt-[0.8rem] mb-4"
            >
              Meet us in Lagos
            </h2>
            <p className="text-wedding-brown m-0 text-[0.82rem] font-bold uppercase">
              Friday / {wedding.weddingDateLabel}
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2">
            <Reveal className="relative px-4 py-12 text-center sm:px-8 sm:py-16 [&>p:not(.eyebrow)]:my-1 [&>p:not(.eyebrow)]:text-[0.92rem]">
              <span className="wedding-display-quiet text-wedding-blue absolute top-4 left-0 text-base">
                01
              </span>
              <p className="eyebrow">The ceremony</p>
              <h3 className="wedding-display-quiet text-wedding-brown mt-3 mb-5 text-[3.7rem] leading-none font-medium">
                {wedding.details.ceremonyTime}
              </h3>
              <p>{wedding.details.venueName}</p>
              <p>{wedding.details.venueAddress}</p>
            </Reveal>
            <Reveal
              className="border-wedding-brown/[34%] relative border-t px-4 py-12 text-center sm:border-t-0 sm:border-l sm:px-8 sm:py-16 [&>p:not(.eyebrow)]:my-1 [&>p:not(.eyebrow)]:text-[0.92rem]"
              delay="short"
            >
              <span className="wedding-display-quiet text-wedding-blue absolute top-4 left-0 text-base">
                02
              </span>
              <p className="eyebrow">The reception</p>
              <h3 className="wedding-display-quiet text-wedding-brown mt-3 mb-5 text-[3.7rem] leading-none font-medium">
                {wedding.details.receptionTime}
              </h3>
              <p>Celebration to follow</p>
              <p>{wedding.details.dressCode}</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section
        id="schedule"
        className="section-anchor bg-wedding-navy text-wedding-cream py-26 lg:py-32"
        aria-labelledby="schedule-heading"
      >
        <div className="section-shell grid gap-16 md:grid-cols-[minmax(18rem,0.8fr)_minmax(28rem,1.2fr)] md:gap-24">
          <Reveal className="self-start md:sticky md:top-12">
            <p className="eyebrow text-wedding-blue">Order of joy</p>
            <h2
              id="schedule-heading"
              className="section-title wedding-display my-4 max-w-[10ch]"
            >
              A day made for remembering
            </h2>
            <p className="text-wedding-cream/72 m-0 max-w-[25rem] leading-[1.7]">
              Come for the vows. Stay for the dancing.
            </p>
          </Reveal>

          <ol className="m-0 list-none p-0">
            {wedding.schedule.map((item, index) => (
              <li
                className="border-wedding-blue/45 border-t last:border-b"
                key={item.id}
              >
                <Reveal
                  className="grid grid-cols-[5.5rem_1fr] gap-5 py-7"
                  delay={index % 2 === 0 ? undefined : "short"}
                >
                  <time className="text-wedding-blue pt-[0.32rem] text-[0.72rem] font-[750]">
                    {item.time}
                  </time>
                  <div>
                    <h3 className="wedding-display m-0 text-[1.8rem] font-medium">
                      {item.title}
                    </h3>
                    {item.description ? (
                      <p className="text-wedding-cream/68 mt-[0.45rem] mb-0 max-w-[28rem] text-[0.88rem] leading-[1.6]">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="bg-wedding-blue grid md:min-h-[42rem] md:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]"
        aria-labelledby="venue-heading"
      >
        <div className="relative min-h-96 [&_img]:object-cover">
          <Image
            src="/images/wedding/reception-table.jpg"
            alt="An elegant wedding reception table prepared for guests"
            fill
            sizes="(max-width: 768px) 100vw, 55vw"
          />
        </div>
        <Reveal className="self-center px-5 py-18 md:px-[clamp(2.5rem,6vw,6rem)] md:py-20 [&>p:not(.eyebrow)]:m-0 [&>p:not(.eyebrow)]:font-bold">
          <MapPin
            aria-hidden="true"
            className="mb-10 size-9"
            strokeWidth={1.25}
          />
          <p className="eyebrow">The venue</p>
          <h2
            id="venue-heading"
            className="section-title wedding-display mt-[0.8rem] mb-4 max-w-[9ch]"
          >
            {wedding.details.venueName}
          </h2>
          <p>{wedding.details.venueAddress}</p>
          <p className="my-6! max-w-[29rem] text-[0.92rem] leading-[1.75] font-medium!">
            A garden celebration in the heart of Lagos. Full location details
            will be shared with guests before the day.
          </p>
          <a
            className="button button-outline-navy focus-ring"
            href={wedding.details.directionsUrl}
            target="_blank"
            rel="noreferrer"
          >
            Get directions
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </Reveal>
      </section>

      <section
        id="share"
        className="section-anchor bg-wedding-brown text-wedding-cream py-26 lg:py-32"
        aria-labelledby="share-heading"
      >
        <div className="section-shell grid gap-14 md:grid-cols-[minmax(17rem,0.72fr)_minmax(27rem,1.28fr)] md:gap-24">
          <Reveal className="self-start md:sticky md:top-12">
            <Camera
              aria-hidden="true"
              className="text-wedding-blue mb-12 size-[2.8rem]"
              strokeWidth={1.25}
            />
            <p className="eyebrow">Seen through your eyes</p>
            <h2
              id="share-heading"
              className="section-title wedding-display my-4 max-w-[10ch]"
            >
              Add your moments to ours.
            </h2>
            <p className="text-wedding-cream/76 m-0 max-w-[29rem] leading-[1.75]">
              The laughs between portraits. The dance moves we missed. The
              beautiful little things only you noticed.
            </p>
          </Reveal>
          <PhotoUploadDemo />
        </div>
      </section>

      {wedding.gallery.length > 0 ? (
        <section
          id="gallery"
          className="section-anchor bg-wedding-paper pt-26 pb-28 lg:py-32"
          aria-labelledby="gallery-heading"
        >
          <div className="section-shell">
            <Reveal className="mb-14 grid gap-6 md:grid-cols-[1.3fr_0.7fr] md:items-end">
              <div>
                <p className="eyebrow">The wedding album</p>
                <h2
                  id="gallery-heading"
                  className="section-title wedding-display mt-[0.8rem] max-w-[10ch]"
                >
                  Love, held in a frame.
                </h2>
              </div>
              <p className="text-wedding-brown m-0 max-w-[31rem] text-[0.9rem] leading-[1.75]">
                A preview collection for the experience. These photographs are
                mock imagery and will be replaced before launch.
              </p>
            </Reveal>
          </div>
          <WeddingGallery photos={wedding.gallery} variant="carousel" />
          <div className="section-shell mt-10 flex justify-center">
            <Link
              href="/gallery"
              className="button button-outline-navy focus-ring"
            >
              View full gallery
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </section>
      ) : null}

      <footer className="bg-wedding-brown text-wedding-cream py-16">
        <div className="section-shell grid items-end gap-10 sm:grid-cols-[1fr_1fr_auto]">
          <p
            className="wedding-display m-0 text-[3.8rem] leading-none"
            aria-label={coupleName}
          >
            F{" "}
            <span className="text-wedding-blue text-[0.65em] italic">
              &amp;
            </span>{" "}
            G
          </p>
          <div>
            <p className="eyebrow">With love, from Lagos</p>
            <p className="text-wedding-cream/72 mt-2 mb-0 text-[0.82rem]">
              {wedding.weddingDateLabel}
            </p>
          </div>
          <a
            href="#home"
            className="focus-ring inline-flex items-center gap-2 text-[0.72rem] font-[750] text-inherit uppercase no-underline"
          >
            Back to top
            <ArrowDown aria-hidden="true" className="size-4 rotate-180" />
          </a>
        </div>
      </footer>
    </main>
  );
}
