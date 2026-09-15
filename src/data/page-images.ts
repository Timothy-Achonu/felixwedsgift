import type { WeddingPhoto } from "@/types/wedding";

export const pageImageSlots = [
  "hero_desktop",
  "hero_mobile",
  "story_primary",
  "story_inset",
  "venue",
] as const;

export type PageImageSlot = (typeof pageImageSlots)[number];

export type PageImageRow = {
  slot: PageImageSlot;
  cloudinary_public_id: string;
  secure_url: string;
  alt: string;
  width: number;
  height: number;
  focal_x: number;
  focal_y: number;
};

export function isPageImageSlot(value: string): value is PageImageSlot {
  return pageImageSlots.includes(value as PageImageSlot);
}

export function pagePhoto(row: PageImageRow): WeddingPhoto {
  return {
    id: row.slot,
    src: row.secure_url,
    alt: row.alt,
    width: row.width,
    height: row.height,
    caption: "",
    focalX: row.focal_x,
    focalY: row.focal_y,
  };
}
