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
      <section className="hero" aria-labelledby="wedding-heading">
        <SiteHeader />
        <Image
          src={wedding.hero.image.src}
          alt={wedding.hero.image.alt}
          fill
          priority
          sizes="100vw"
          className="hero-image"
        />
        <div className="hero-wash" aria-hidden="true" />

        <div className="hero-content">
          <p className="hero-eyebrow hero-reveal hero-reveal-one">
            {wedding.hero.eyebrow}
          </p>
          <h1
            id="wedding-heading"
            aria-label={coupleName}
            className="hero-title font-display"
          >
            <span className="hero-reveal hero-reveal-two">
              {wedding.couple.partnerOne}
            </span>
            <span className="hero-ampersand hero-reveal hero-reveal-three">
              &amp;
            </span>
            <span className="hero-reveal hero-reveal-four">
              {wedding.couple.partnerTwo}
            </span>
          </h1>

          <div className="hero-details hero-reveal hero-reveal-five">
            <p>{wedding.hero.message}</p>
            <span aria-hidden="true" />
            <time dateTime={wedding.weddingDate}>
              {wedding.weddingDateLabel}
            </time>
            <span aria-hidden="true" />
            <p>{wedding.details.venueAddress}</p>
          </div>
        </div>

        <a className="hero-scroll focus-ring" href="#countdown">
          <span>Begin</span>
          <ArrowDown aria-hidden="true" className="size-4" />
        </a>
      </section>

      <section id="countdown" className="countdown-section section-anchor">
        <Reveal className="countdown-intro">
          <p className="eyebrow">Until we say I do</p>
          <h2 className="font-display">The celebration begins in</h2>
        </Reveal>
        <WeddingCountdown
          weddingDate={wedding.weddingDate}
          timezone={wedding.timezone}
          weddingDateLabel={wedding.weddingDateLabel}
        />
      </section>

      <section
        id="story"
        className="story section-anchor"
        aria-labelledby="story-heading"
      >
        <div className="section-shell story-grid">
          <Reveal className="story-copy">
            <p className="eyebrow">Our story</p>
            <h2 id="story-heading" className="section-title font-display">
              {wedding.story.heading}
            </h2>
            <p className="story-lead">{wedding.story.introduction}</p>
            <p className="story-body">{wedding.story.body}</p>
            <p className="story-signoff font-display">Felix &amp; Gift</p>
          </Reveal>

          <Reveal className="story-images" delay="short">
            <figure className="story-image-primary">
              <Image
                src={wedding.story.images[0].src}
                alt={wedding.story.images[0].alt}
                fill
                sizes="(max-width: 768px) 78vw, 40vw"
              />
            </figure>
            <figure className="story-image-secondary">
              <Image
                src={wedding.story.images[1].src}
                alt={wedding.story.images[1].alt}
                fill
                sizes="(max-width: 768px) 54vw, 22vw"
              />
            </figure>
            <p className="story-image-note">One promise, made together</p>
          </Reveal>
        </div>
      </section>

      <section
        id="details"
        className="details section-anchor"
        aria-labelledby="details-heading"
      >
        <div className="section-shell">
          <Reveal className="details-heading">
            <p className="eyebrow">Save the date</p>
            <h2 id="details-heading" className="section-title font-display">
              Meet us in Lagos
            </h2>
            <p>Friday / {wedding.weddingDateLabel}</p>
          </Reveal>

          <div className="details-grid">
            <Reveal className="detail-block">
              <span className="detail-number">01</span>
              <p className="eyebrow">The ceremony</p>
              <h3 className="font-display">{wedding.details.ceremonyTime}</h3>
              <p>{wedding.details.venueName}</p>
              <p>{wedding.details.venueAddress}</p>
            </Reveal>
            <Reveal className="detail-block" delay="short">
              <span className="detail-number">02</span>
              <p className="eyebrow">The reception</p>
              <h3 className="font-display">{wedding.details.receptionTime}</h3>
              <p>Celebration to follow</p>
              <p>{wedding.details.dressCode}</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section
        id="schedule"
        className="schedule section-anchor"
        aria-labelledby="schedule-heading"
      >
        <div className="section-shell schedule-layout">
          <Reveal className="schedule-heading">
            <p className="eyebrow">Order of joy</p>
            <h2 id="schedule-heading" className="section-title font-display">
              A day made for remembering
            </h2>
            <p>Come for the vows. Stay for the dancing.</p>
          </Reveal>

          <ol className="timeline">
            {wedding.schedule.map((item, index) => (
              <li key={item.id}>
                <Reveal delay={index % 2 === 0 ? undefined : "short"}>
                  <time>{item.time}</time>
                  <div>
                    <h3 className="font-display">{item.title}</h3>
                    {item.description ? <p>{item.description}</p> : null}
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="venue" aria-labelledby="venue-heading">
        <div className="venue-image-wrap">
          <Image
            src="/images/wedding/reception-table.jpg"
            alt="An elegant wedding reception table prepared for guests"
            fill
            sizes="(max-width: 768px) 100vw, 55vw"
          />
        </div>
        <Reveal className="venue-copy">
          <MapPin aria-hidden="true" className="venue-pin" strokeWidth={1.25} />
          <p className="eyebrow">The venue</p>
          <h2 id="venue-heading" className="section-title font-display">
            {wedding.details.venueName}
          </h2>
          <p>{wedding.details.venueAddress}</p>
          <p className="venue-note">
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
        className="share section-anchor"
        aria-labelledby="share-heading"
      >
        <div className="section-shell share-layout">
          <Reveal className="share-heading">
            <Camera
              aria-hidden="true"
              className="share-camera"
              strokeWidth={1.25}
            />
            <p className="eyebrow">Seen through your eyes</p>
            <h2 id="share-heading" className="section-title font-display">
              Add your moments to ours.
            </h2>
            <p>
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
          className="gallery section-anchor"
          aria-labelledby="gallery-heading"
        >
          <div className="section-shell">
            <Reveal className="gallery-heading">
              <div>
                <p className="eyebrow">The wedding album</p>
                <h2 id="gallery-heading" className="section-title font-display">
                  Love, held in a frame.
                </h2>
              </div>
              <p>
                A preview collection for the experience. These photographs are
                mock imagery and will be replaced before launch.
              </p>
            </Reveal>
          </div>
          <WeddingGallery photos={wedding.gallery} variant="carousel" />
          <div className="section-shell gallery-more">
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

      <footer className="footer">
        <div className="section-shell footer-grid">
          <p className="footer-mark font-display" aria-label={coupleName}>
            F <span>&amp;</span> G
          </p>
          <div>
            <p className="eyebrow">With love, from Lagos</p>
            <p>{wedding.weddingDateLabel}</p>
          </div>
          <a href="#home" className="footer-top focus-ring">
            Back to top
            <ArrowDown aria-hidden="true" className="size-4 rotate-180" />
          </a>
        </div>
      </footer>
    </main>
  );
}
