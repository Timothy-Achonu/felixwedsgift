export const guestPhotoMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const maximumGuestPhotoBytes = 10_000_000;
export const maximumGuestPhotoDimension = 8192;
export const maximumGuestPhotoBatch = 10;
export const maximumPhotoCaptionLength = 240;

export type GuestPhotoStatus = "PENDING" | "APPROVED" | "REJECTED";

export type AdminPhoto = {
  id: string;
  cloudinary_public_id: string;
  secure_url: string;
  cloudinary_delivery_type: "authenticated" | "upload";
  original_filename: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  caption: string | null;
  status: GuestPhotoStatus;
  revision: number;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
};
