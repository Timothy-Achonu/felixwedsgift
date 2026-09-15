import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import GalleryPage, { generateMetadata } from "@/app/gallery/page";
import { mockWeddingContent } from "@/data/mock-wedding";

describe("gallery page", () => {
  it("generates metadata from the wedding content", async () => {
    const metadata = await generateMetadata();

    expect(metadata.title).toBe("Wedding Gallery | Felix & Gift");
    expect(metadata.description).toBe(
      "Photographs from Felix and Gift's wedding celebration.",
    );
  });

  it("renders the complete wedding album and a route home", async () => {
    const photographCount = mockWeddingContent.gallery.length;

    render(await GalleryPage());

    expect(photographCount).toBeGreaterThanOrEqual(108);
    expect(
      screen.getByRole("heading", { name: "Every moment, together." }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `${String(photographCount).padStart(2, "0")} photographs`,
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Open photo/ })).toHaveLength(
      photographCount,
    );
    expect(
      screen.getByRole("link", { name: "Back to the celebration" }),
    ).toHaveAttribute("href", "/");
  });
});
