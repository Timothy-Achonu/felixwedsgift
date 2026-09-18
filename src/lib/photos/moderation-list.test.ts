import { describe, expect, it } from "vitest";

import type { AdminPhoto } from "./constants";
import { applyPhotoModeration } from "./moderation-list";

function photo(
  values: Partial<AdminPhoto> & Pick<AdminPhoto, "id" | "status">,
): AdminPhoto {
  return {
    cloudinary_public_id: values.id,
    secure_url: "https://example.com/photo.jpg",
    cloudinary_delivery_type: "authenticated",
    original_filename: "moment.jpg",
    width: 1600,
    height: 1200,
    format: "jpg",
    bytes: 120_000,
    caption: null,
    revision: 1,
    created_at: "2026-09-18T00:00:00.000Z",
    updated_at: "2026-09-18T00:00:00.000Z",
    approved_at: null,
    ...values,
  };
}

describe("applyPhotoModeration", () => {
  it("removes a photo from a filtered tab when its status leaves that tab", () => {
    const pending = photo({ id: "photo-1", status: "PENDING" });
    expect(
      applyPhotoModeration([pending], "PENDING", [
        { id: "photo-1", status: "APPROVED", revision: 2 },
      ]),
    ).toEqual([]);
  });

  it("keeps the updated photo on the all tab", () => {
    const pending = photo({ id: "photo-1", status: "PENDING" });
    expect(
      applyPhotoModeration([pending], "ALL", [
        { id: "photo-1", status: "APPROVED", revision: 2 },
      ]),
    ).toEqual([
      expect.objectContaining({
        id: "photo-1",
        status: "APPROVED",
        revision: 2,
      }),
    ]);
  });

  it("keeps caption edits on the current tab", () => {
    const pending = photo({ id: "photo-1", status: "PENDING" });
    expect(
      applyPhotoModeration([pending], "PENDING", [
        { id: "photo-1", caption: "A toast", revision: 2 },
      ]),
    ).toEqual([
      expect.objectContaining({
        id: "photo-1",
        status: "PENDING",
        caption: "A toast",
      }),
    ]);
  });
});
