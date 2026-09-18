import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AdminPhoto } from "@/lib/photos/constants";

const toasts = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/components/ui/sonner", () => toasts);

import { PhotoModeration } from "./photo-moderation";

const pendingPhoto: AdminPhoto = {
  id: "photo-1",
  cloudinary_public_id: "wedding/guest/photo-1",
  secure_url: "https://example.com/photo.jpg",
  cloudinary_delivery_type: "authenticated",
  original_filename: "moment.jpg",
  width: 1600,
  height: 1200,
  format: "jpg",
  bytes: 1_200_000,
  caption: null,
  status: "PENDING",
  revision: 1,
  created_at: "2026-09-18T00:00:00.000Z",
  updated_at: "2026-09-18T00:00:00.000Z",
  approved_at: null,
};

describe("photo moderation list", () => {
  beforeEach(() => {
    toasts.toastSuccess.mockReset();
    toasts.toastError.mockReset();
  });

  it("removes an approved photo from the pending tab", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      Response.json({
        photo: { revision: 2, status: "APPROVED" },
      }),
    );

    render(<PhotoModeration initialPhotos={[pendingPhoto]} status="PENDING" />);

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() => {
      expect(screen.getByText("You're all caught up.")).toBeInTheDocument();
    });
    expect(toasts.toastSuccess).toHaveBeenCalledWith("Photograph approved");
    expect(
      screen.queryByRole("button", { name: "Approve" }),
    ).not.toBeInTheDocument();
  });
});
