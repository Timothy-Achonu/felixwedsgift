import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home, { generateMetadata } from "@/app/page";

describe("home page", () => {
  it("generates metadata from the wedding content", async () => {
    const metadata = await generateMetadata();

    expect(metadata.title).toBe("Felix & Gift | 18 December 2026");
    expect(metadata.description).toBe(
      "Join Felix and Gift for a joyful wedding celebration in Lagos, Nigeria.",
    );
  });

  it("renders the complete public wedding structure", async () => {
    render(await Home());

    expect(
      screen.getByRole("heading", { name: "Felix & Gift" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "We found home in each other." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Meet us in Lagos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "A day made for remembering" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Add your moments to ours." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Love, held in a frame." }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View full gallery" }),
    ).toHaveAttribute("href", "/gallery");
    expect(screen.getAllByRole("button", { name: /Open photo/ })).toHaveLength(
      5,
    );
  });

  it("uses independent desktop and phone focal positions and cover-aware sizes", async () => {
    const { container } = render(await Home());
    const picture = container.querySelector("picture")!;
    const source = picture.querySelector("source")!;
    const img = picture.querySelector("img")!;
    expect(source.getAttribute("sizes")).toMatch(/^max\(100vw, [\d.]+svh\)$/);
    expect(img.getAttribute("sizes")).toMatch(/^max\(100vw, [\d.]+svh\)$/);
    expect(img.style.getPropertyValue("--hero-mobile-position")).not.toBe("");
    expect(img.style.getPropertyValue("--hero-desktop-position")).not.toBe("");
    expect(img.className).toContain(
      "md:object-[position:var(--hero-desktop-position)]",
    );
    expect(img).toHaveAttribute("loading", "eager");
  });
});
