import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WeddingGallery } from "@/components/wedding/wedding-gallery";
import type { WeddingPhoto } from "@/types/wedding";

const photos: WeddingPhoto[] = Array.from({ length: 6 }, (_, index) => ({
  id: `photo-${index}`,
  src: "/images/wedding/hero-couple.jpg",
  alt: `Wedding moment ${index + 1}`,
  width: 2000,
  height: 1600,
  caption: `Moment ${index + 1}`,
}));

describe("wedding gallery", () => {
  beforeEach(() => {
    vi.spyOn(HTMLDialogElement.prototype, "showModal").mockImplementation(
      function (this: HTMLDialogElement) {
        this.setAttribute("open", "");
      },
    );
    vi.spyOn(HTMLDialogElement.prototype, "close").mockImplementation(
      function (this: HTMLDialogElement) {
        this.removeAttribute("open");
      },
    );
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 0;
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it("loads the remaining mock photographs on request", () => {
    render(<WeddingGallery photos={photos} />);

    expect(screen.getAllByRole("button", { name: /Open photo/ })).toHaveLength(
      5,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "See more moments +1" }),
    );
    expect(screen.getAllByRole("button", { name: /Open photo/ })).toHaveLength(
      6,
    );
  });

  it("opens the viewer and navigates between photographs", () => {
    render(<WeddingGallery photos={photos} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Open photo: Moment 1" }),
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("open");
    expect(screen.getByText("Moment 1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next photograph" }));
    expect(screen.getByText("Moment 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close photograph" }));
    expect(screen.getByRole("dialog", { hidden: true })).not.toHaveAttribute(
      "open",
    );
  });
});
