"use client";

import { useState } from "react";

import type { WeddingPhoto } from "@/types/wedding";
import { WeddingGallery } from "@/components/wedding/wedding-gallery";

export function GalleryWall({
  initialPhotos,
  initialCursor,
}: {
  initialPhotos: WeddingPhoto[];
  initialCursor: string | null;
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [cursor, setCursor] = useState(initialCursor);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function loadMore() {
    if (!cursor) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `/api/gallery/photos?cursor=${encodeURIComponent(cursor)}`,
      );
      const result = (await response.json()) as {
        photos?: WeddingPhoto[];
        nextCursor?: string | null;
        error?: string;
      };
      if (!response.ok || !result.photos)
        throw new Error(result.error ?? "The gallery could not be loaded.");
      setPhotos((current) => [...current, ...result.photos!]);
      setCursor(result.nextCursor ?? null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "The gallery could not be loaded.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <WeddingGallery photos={photos} variant="wall" />
      {error ? (
        <p
          className="section-shell text-status-error mt-6 text-center"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {cursor ? (
        <div className="section-shell flex justify-center py-10">
          <button
            type="button"
            className="button button-outline-navy focus-ring"
            disabled={busy}
            onClick={() => void loadMore()}
          >
            {busy ? "Loading photographs..." : "Load more"}
          </button>
        </div>
      ) : null}
    </>
  );
}
