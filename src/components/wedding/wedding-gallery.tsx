"use client";

import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import type { WeddingPhoto } from "@/types/wedding";

const INITIAL_PHOTO_COUNT = 5;

type WeddingGalleryProps = {
  photos: WeddingPhoto[];
  variant: "carousel" | "wall";
};

export function WeddingGallery({ photos, variant }: WeddingGalleryProps) {
  const displayedPhotos =
    variant === "carousel" ? photos.slice(0, INITIAL_PHOTO_COUNT) : photos;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const touchStartRef = useRef<number | null>(null);

  const activePhoto =
    activeIndex === null ? null : displayedPhotos[activeIndex];

  const updateCarouselControls = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    setCanScrollPrevious(carousel.scrollLeft > 1);
    setCanScrollNext(
      carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 1,
    );
  }, []);

  useEffect(() => {
    if (variant !== "carousel") return;

    const carousel = carouselRef.current;
    if (!carousel) return;

    updateCarouselControls();
    carousel.addEventListener("scroll", updateCarouselControls, {
      passive: true,
    });
    window.addEventListener("resize", updateCarouselControls);

    return () => {
      carousel.removeEventListener("scroll", updateCarouselControls);
      window.removeEventListener("resize", updateCarouselControls);
    };
  }, [updateCarouselControls, variant]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (activeIndex !== null) {
      const previousOverflow = document.body.style.overflow;
      if (!dialog.open) dialog.showModal();
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }

    if (dialog.open) dialog.close();
  }, [activeIndex]);

  function openPhoto(index: number) {
    previousFocusRef.current = document.activeElement as HTMLElement;
    setActiveIndex(index);
  }

  function closePhoto() {
    setActiveIndex(null);
    window.requestAnimationFrame(() => previousFocusRef.current?.focus());
  }

  function showPrevious() {
    setActiveIndex((current) => {
      if (current === null) return null;
      return (current - 1 + displayedPhotos.length) % displayedPhotos.length;
    });
  }

  function showNext() {
    setActiveIndex((current) => {
      if (current === null) return null;
      return (current + 1) % displayedPhotos.length;
    });
  }

  function scrollCarousel(direction: -1 | 1) {
    const carousel = carouselRef.current;
    if (!carousel) return;

    carousel.scrollBy({
      left: direction * carousel.clientWidth * 0.8,
      behavior: "smooth",
    });
  }

  if (displayedPhotos.length === 0) {
    return (
      <div className="bg-wedding-paper px-5 py-24 text-center">
        <p className="eyebrow">The wedding album</p>
        <p className="wedding-display mx-auto mt-4 mb-0 max-w-[14ch] text-[clamp(2rem,6vw,4rem)] leading-none">
          The album is waiting for its first memory.
        </p>
      </div>
    );
  }

  const photoItems = displayedPhotos.map((photo, index) => {
    const isPortrait = photo.height > photo.width;

    return (
      <figure
        className={`m-0 inline-block w-full break-inside-avoid align-top ${
          variant === "carousel"
            ? `h-[clamp(23rem,110vw,34rem)] snap-center ${
                isPortrait
                  ? "flex-[0_0_min(82vw,31rem)]"
                  : "flex-[0_0_min(88vw,46rem)]"
              }`
            : ""
        }`}
        key={photo.id}
      >
        <button
          type="button"
          className={`focus-ring group bg-wedding-mist relative block w-full overflow-hidden border-0 p-0 ${
            variant === "carousel"
              ? "h-full"
              : "focus-visible:z-1 focus-visible:outline-offset-[-4px]"
          }`}
          aria-label={`Open photo: ${photo.caption}`}
          onClick={() => openPhoto(index)}
        >
          {variant === "carousel" ? (
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 640px) 82vw, (max-width: 1024px) 55vw, 42vw"
              className="object-cover transition-transform duration-600 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.025]"
            />
          ) : (
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
              className="block h-auto w-full transition-transform duration-600 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.025]"
            />
          )}
          <span
            className="bg-wedding-cream text-wedding-navy absolute right-3 bottom-3 grid size-10 translate-y-2 place-items-center rounded-full opacity-0 transition-[opacity,transform] duration-180 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
            aria-hidden="true"
          >
            <Expand className="size-5" />
          </span>
        </button>
      </figure>
    );
  });

  return (
    <>
      {variant === "carousel" ? (
        <div className="relative [--gallery-carousel-gutter:max(1.25rem,calc((100vw-1240px)/2))]">
          <div
            ref={carouselRef}
            id="wedding-gallery-carousel"
            className="scrollbar-hide flex snap-x snap-mandatory scroll-px-(--gallery-carousel-gutter) gap-4 overflow-x-auto overscroll-x-contain px-(--gallery-carousel-gutter)"
            role="region"
            aria-label="Wedding album preview"
          >
            {photoItems}
          </div>
          {displayedPhotos.length > 1 ? (
            <div className="pointer-events-none absolute inset-0 z-1">
              <button
                type="button"
                className="focus-ring bg-wedding-navy text-wedding-cream hover:not-disabled:bg-wedding-cream hover:not-disabled:text-wedding-navy pointer-events-auto absolute top-1/2 left-[max(calc(env(safe-area-inset-left,0px)+0.75rem),calc(var(--gallery-carousel-gutter)+0.75rem))] z-1 grid size-12 -translate-y-1/2 place-items-center rounded-full border-0 transition-colors duration-180 disabled:invisible"
                aria-label="Scroll gallery backward"
                aria-controls="wedding-gallery-carousel"
                disabled={!canScrollPrevious}
                onClick={() => scrollCarousel(-1)}
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                className="focus-ring bg-wedding-navy text-wedding-cream hover:not-disabled:bg-wedding-cream hover:not-disabled:text-wedding-navy pointer-events-auto absolute top-1/2 right-[max(calc(env(safe-area-inset-right,0px)+0.75rem),calc(var(--gallery-carousel-gutter)+0.75rem))] z-1 grid size-12 -translate-y-1/2 place-items-center rounded-full border-0 transition-colors duration-180 disabled:invisible"
                aria-label="Scroll gallery forward"
                aria-controls="wedding-gallery-carousel"
                disabled={!canScrollNext}
                onClick={() => scrollCarousel(1)}
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="columns-1 gap-0 leading-none sm:columns-2 lg:columns-3 xl:columns-4">
          {photoItems}
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="bg-wedding-navy text-wedding-cream backdrop:bg-wedding-navy/[92%] m-0 h-dvh max-h-none w-screen max-w-none border-0 p-0"
        aria-label="Wedding photograph viewer"
        onClose={() => setActiveIndex(null)}
        onCancel={(event) => {
          event.preventDefault();
          closePhoto();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closePhoto();
        }}
        onKeyDown={(event) => {
          if (displayedPhotos.length < 2) return;
          if (event.key === "ArrowLeft") showPrevious();
          if (event.key === "ArrowRight") showNext();
        }}
        onPointerDown={(event) => {
          touchStartRef.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (displayedPhotos.length < 2 || touchStartRef.current === null) {
            return;
          }
          const distance = event.clientX - touchStartRef.current;
          touchStartRef.current = null;
          if (Math.abs(distance) < 60) return;
          if (distance > 0) showPrevious();
          else showNext();
        }}
      >
        {activePhoto ? (
          <div className="grid min-h-full grid-rows-[1fr_auto] px-5 pt-18 pb-5">
            <button
              ref={closeButtonRef}
              type="button"
              className="focus-ring border-wedding-cream/45 bg-wedding-navy/74 text-wedding-cream fixed top-4 right-4 z-2 grid size-11 place-items-center rounded-full border"
              aria-label="Close photograph viewer"
              onClick={closePhoto}
            >
              <X aria-hidden="true" />
            </button>

            {displayedPhotos.length > 1 ? (
              <>
                <button
                  type="button"
                  className="focus-ring border-wedding-cream/45 bg-wedding-navy/74 text-wedding-cream hover:bg-wedding-cream hover:text-wedding-navy fixed top-1/2 left-4 z-2 grid size-11 -translate-y-1/2 place-items-center rounded-full border"
                  aria-label="Previous photograph"
                  onClick={showPrevious}
                >
                  <ChevronLeft aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="focus-ring border-wedding-cream/45 bg-wedding-navy/74 text-wedding-cream hover:bg-wedding-cream hover:text-wedding-navy fixed top-1/2 right-4 z-2 grid size-11 -translate-y-1/2 place-items-center rounded-full border"
                  aria-label="Next photograph"
                  onClick={showNext}
                >
                  <ChevronRight aria-hidden="true" />
                </button>
              </>
            ) : null}

            <div className="relative min-h-0 [&_img]:object-contain">
              <Image
                src={activePhoto.src}
                alt={activePhoto.alt}
                fill
                priority
                sizes="100vw"
              />
            </div>

            <div className="border-wedding-cream/25 flex flex-wrap justify-between gap-x-8 gap-y-2 border-t pt-4">
              <p className="font-display m-0 text-[1.2rem] italic">
                {activePhoto.caption}
              </p>
              {activePhoto.guestName ? (
                <span className="text-wedding-cream/64 text-[0.72rem]">
                  {activePhoto.guestName}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
