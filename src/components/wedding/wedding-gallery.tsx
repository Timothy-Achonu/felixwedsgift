"use client";

import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { WeddingPhoto } from "@/types/wedding";

const INITIAL_PHOTO_COUNT = 5;

type WeddingGalleryProps = {
  photos: WeddingPhoto[];
};

export function WeddingGallery({ photos }: WeddingGalleryProps) {
  const [showAll, setShowAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const touchStartRef = useRef<number | null>(null);

  const visiblePhotos = showAll ? photos : photos.slice(0, INITIAL_PHOTO_COUNT);
  const activePhoto = activeIndex === null ? null : photos[activeIndex];

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
      return (current - 1 + photos.length) % photos.length;
    });
  }

  function showNext() {
    setActiveIndex((current) => {
      if (current === null) return null;
      return (current + 1) % photos.length;
    });
  }

  return (
    <>
      <div className="gallery-wall">
        {visiblePhotos.map((photo) => {
          const index = photos.findIndex(({ id }) => id === photo.id);

          return (
            <figure className="gallery-item" key={photo.id}>
              <button
                type="button"
                className="gallery-button focus-ring"
                aria-label={`Open photo: ${photo.caption}`}
                onClick={() => openPhoto(index)}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
                />
                <span className="gallery-overlay" aria-hidden="true">
                  <Expand className="size-5" />
                </span>
              </button>
              <figcaption>{photo.caption}</figcaption>
            </figure>
          );
        })}
      </div>

      {!showAll && photos.length > INITIAL_PHOTO_COUNT ? (
        <div className="gallery-more">
          <button
            type="button"
            className="button button-outline-navy focus-ring"
            onClick={() => setShowAll(true)}
          >
            See more moments
            <span aria-hidden="true">
              +{photos.length - INITIAL_PHOTO_COUNT}
            </span>
          </button>
        </div>
      ) : null}

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
          if (event.key === "ArrowLeft") showPrevious();
          if (event.key === "ArrowRight") showNext();
        }}
        onPointerDown={(event) => {
          touchStartRef.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (touchStartRef.current === null) return;
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

            <button
              type="button"
              className="lightbox-arrow lightbox-previous focus-ring"
              aria-label="Previous photograph"
              onClick={showPrevious}
            >
              <ChevronLeft aria-hidden="true" />
            </button>

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

            <button
              type="button"
              className="lightbox-arrow lightbox-next focus-ring"
              aria-label="Next photograph"
              onClick={showNext}
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
