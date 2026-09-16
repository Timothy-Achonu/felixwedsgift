import type { PageImageSlot } from "@/data/page-images";

export const maximumPageImageBytes = 10_000_000;
export const maximumPageImageDimension = 8192;
export const pageImageMimeTypes = ["image/jpeg", "image/png", "image/webp"];
export const pageImageFormats = ["jpg", "jpeg", "png", "webp"];

const minimumHeroSizes = {
  hero_desktop: { width: 1600, height: 900 },
  hero_mobile: { width: 900, height: 1600 },
} as const;

export function pageImageDimensionsError(
  slot: PageImageSlot,
  width: number,
  height: number,
): string | null {
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1
  ) {
    return "Choose a photograph with valid pixel dimensions.";
  }
  if (width > maximumPageImageDimension || height > maximumPageImageDimension) {
    return "Choose a copy with neither side larger than 8192 pixels. Keep your original separately.";
  }
  if (slot === "hero_desktop" || slot === "hero_mobile") {
    const minimum = minimumHeroSizes[slot];
    // A cover composition can crop either axis, but must never enlarge the source.
    if (width < minimum.width || height < minimum.height) {
      return `Choose a larger photo: this hero needs at least ${minimum.width} x ${minimum.height} pixels without enlargement.`;
    }
  }
  return null;
}

export function heroImageSizes(width: number, height: number): string {
  // The hero is 92svh tall. Cover may scale a wide source beyond the viewport
  // width, so 100vw alone can request too few pixels for the visible crop.
  return `max(100vw, ${Number(((92 * width) / height).toFixed(3))}svh)`;
}
