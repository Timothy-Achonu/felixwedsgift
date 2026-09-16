import type { PageImageSlot } from "@/data/page-images";
import {
  maximumPageImageBytes,
  pageImageDimensionsError,
  pageImageMimeTypes,
} from "@/lib/images/page-images";

export async function validatePageImageFile(file: File, slot: PageImageSlot) {
  if (!pageImageMimeTypes.includes(file.type)) {
    throw new Error("Choose a JPEG, PNG or WebP photograph.");
  }
  if (file.size === 0 || file.size > maximumPageImageBytes) {
    throw new Error("Choose a non-empty photograph no larger than 10 MB.");
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    image.src = url;
    try {
      await image.decode();
    } catch {
      throw new Error(
        "This photograph could not be opened. Choose a valid JPEG, PNG or WebP file.",
      );
    }
    const error = pageImageDimensionsError(
      slot,
      image.naturalWidth,
      image.naturalHeight,
    );
    if (error) throw new Error(error);
  } finally {
    URL.revokeObjectURL(url);
  }
}
