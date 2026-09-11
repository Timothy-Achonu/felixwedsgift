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
    vi.spyOn(HTMLDialogElement.prototype, "close").mockImplementation(function (
      this: HTMLDialogElement,
    ) {
      this.removeAttribute("open");
    });
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 0;
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it("limits the carousel to a five-photograph preview", () => {
    render(<WeddingGallery photos={photos} variant="carousel" />);

    expect(screen.getAllByRole("button", { name: /Open photo/ })).toHaveLength(
      5,
    );
  });

  it("renders the complete collection in the wall", () => {
    render(<WeddingGallery photos={photos} variant="wall" />);

    expect(screen.getAllByRole("button", { name: /Open photo/ })).toHaveLength(
      6,
    );
  });

  it("scrolls the manual carousel and updates its boundary controls", () => {
    render(<WeddingGallery photos={photos} variant="carousel" />);
    const carousel = screen.getByRole("region", {
      name: "Wedding album preview",
    });
    const scrollBy = vi.fn();

    Object.defineProperties(carousel, {
      clientWidth: { configurable: true, value: 500 },
      scrollWidth: { configurable: true, value: 1200 },
      scrollLeft: { configurable: true, value: 0, writable: true },
      scrollBy: { configurable: true, value: scrollBy },
    });
    fireEvent(window, new Event("resize"));

    const previousButton = screen.getByRole("button", {
      name: "Scroll gallery backward",
    });
    const nextButton = screen.getByRole("button", {
      name: "Scroll gallery forward",
    });
    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeEnabled();

    fireEvent.click(nextButton);
    expect(scrollBy).toHaveBeenCalledWith({ left: 400, behavior: "smooth" });

    carousel.scrollLeft = 700;
    fireEvent.scroll(carousel);
    expect(previousButton).toBeEnabled();
    expect(nextButton).toBeDisabled();
  });

  it("opens the viewer and navigates between photographs", () => {
    render(<WeddingGallery photos={photos} variant="wall" />);

    fireEvent.click(
      screen.getByRole("button", { name: "Open photo: Moment 1" }),
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("open");
    expect(screen.getByText("Moment 1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next photograph" }));
    expect(screen.getByText("Moment 2")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Close photograph viewer" }),
    );
    expect(screen.getByRole("dialog", { hidden: true })).not.toHaveAttribute(
      "open",
    );
  });

  it("renders an empty album message when no photographs are available", () => {
    render(<WeddingGallery photos={[]} variant="wall" />);

    expect(
      screen.getByText("The album is waiting for its first memory."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("hides gallery navigation when there is only one photograph", () => {
    render(<WeddingGallery photos={photos.slice(0, 1)} variant="carousel" />);

    expect(
      screen.queryByRole("button", { name: "Scroll gallery forward" }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Open photo: Moment 1" }),
    );
    expect(
      screen.queryByRole("button", { name: "Next photograph" }),
    ).not.toBeInTheDocument();
  });
});
