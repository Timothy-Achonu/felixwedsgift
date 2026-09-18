import type { AdminPhoto, GuestPhotoStatus } from "./constants";

export type PhotoModerationTab = GuestPhotoStatus | "ALL";

export type PhotoModerationUpdate = {
  id: string;
  status?: GuestPhotoStatus;
  revision?: number;
  caption?: string | null;
};

export function applyPhotoModeration(
  photos: AdminPhoto[],
  tab: PhotoModerationTab,
  updates: PhotoModerationUpdate[],
) {
  const byId = new Map(updates.map((update) => [update.id, update]));
  return photos.flatMap((photo) => {
    const update = byId.get(photo.id);
    if (!update) return [photo];
    const next = { ...photo, ...update };
    if (tab !== "ALL" && next.status !== tab) return [];
    return [next];
  });
}
