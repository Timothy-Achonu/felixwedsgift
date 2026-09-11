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
      <div className="gallery-empty">
        <p className="eyebrow">The wedding album</p>
        <p className="font-display">
          The album is waiting for its first memory.
        </p>
      </div>
    );
  }

  const photoItems = displayedPhotos.map((photo, index) => {
    const isPortrait = photo.height > photo.width;

    return (
      <figure
        className={`gallery-item ${
          variant === "carousel"
            ? `gallery-carousel-item ${isPortrait ? "is-portrait" : "is-landscape"}`
            : ""
        }`}
        key={photo.id}
      >
        <button
          type="button"
          className="gallery-button focus-ring"
          aria-label={`Open photo: ${photo.caption}`}
          onClick={() => openPhoto(index)}
        >
          {variant === "carousel" ? (
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 640px) 82vw, (max-width: 1024px) 55vw, 42vw"
            />
          ) : (
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
            />
          )}
          <span className="gallery-overlay" aria-hidden="true">
            <Expand className="size-5" />
          </span>
        </button>
      </figure>
    );
  });

  return (
    <>
      {variant === "carousel" ? (
        <div className="gallery-carousel-shell">
          <div
            ref={carouselRef}
            id="wedding-gallery-carousel"
            className="gallery-carousel"
            role="region"
            aria-label="Wedding album preview"
          >
            {photoItems}
          </div>
          {displayedPhotos.length > 1 ? (
            <div className="gallery-carousel-controls">
              <button
                type="button"
                className="gallery-carousel-arrow gallery-carousel-previous focus-ring"
                aria-label="Scroll gallery backward"
                aria-controls="wedding-gallery-carousel"
                disabled={!canScrollPrevious}
                onClick={() => scrollCarousel(-1)}
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                className="gallery-carousel-arrow gallery-carousel-next focus-ring"
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
        <div className="gallery-wall">{photoItems}</div>
      )}

      <dialog
        ref={dialogRef}
        className="lightbox"
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
          <div className="lightbox-content">
            <button
              ref={closeButtonRef}
              type="button"
              className="lightbox-close focus-ring"
              aria-label="Close photograph viewer"
              onClick={closePhoto}
            >
              <X aria-hidden="true" />
            </button>

            {displayedPhotos.length > 1 ? (
              <>
                <button
                  type="button"
                  className="lightbox-arrow lightbox-previous focus-ring"
                  aria-label="Previous photograph"
                  onClick={showPrevious}
                >
                  <ChevronLeft aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="lightbox-arrow lightbox-next focus-ring"
                  aria-label="Next photograph"
                  onClick={showNext}
                >
                  <ChevronRight aria-hidden="true" />
                </button>
              </>
            ) : null}

            <div className="lightbox-image">
              <Image
                src={activePhoto.src}
                alt={activePhoto.alt}
                fill
                priority
                sizes="100vw"
              />
            </div>

            <div className="lightbox-caption">
              <p>{activePhoto.caption}</p>
              {activePhoto.guestName ? (
                <span>{activePhoto.guestName}</span>
              ) : null}
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
