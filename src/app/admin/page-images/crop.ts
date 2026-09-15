export type CropPosition = { x: number; y: number };

export const heroCropSizes = {
  hero_desktop: { width: 1600, height: 900 },
  hero_mobile: { width: 900, height: 1600 },
} as const;

export async function cropHeroFile(
  file: File,
  size: { width: number; height: number },
  position: CropPosition,
): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    image.src = url;
    await image.decode();
    const scale = Math.max(
      size.width / image.naturalWidth,
      size.height / image.naturalHeight,
    );
    if (scale > 1) {
      throw new Error(
        `Choose a larger photo. The finished crop must be at least ${size.width} x ${size.height} pixels without upscaling.`,
      );
    }
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("Your browser could not prepare the image crop.");
    const scaledWidth = image.naturalWidth * scale;
    const scaledHeight = image.naturalHeight * scale;
    context.drawImage(
      image,
      (size.width - scaledWidth) * position.x,
      (size.height - scaledHeight) * position.y,
      scaledWidth,
      scaledHeight,
    );
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.88),
    );
    if (!blob) throw new Error("Your browser could not export the image crop.");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}
