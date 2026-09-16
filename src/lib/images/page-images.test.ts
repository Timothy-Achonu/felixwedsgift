import { describe, expect, it } from "vitest";

import { heroImageSizes, pageImageDimensionsError } from "./page-images";

describe("page image source requirements", () => {
  it("accepts originals of different aspect ratios and legacy crops", () => {
    expect(pageImageDimensionsError("hero_desktop", 4000, 3000)).toBeNull();
    expect(pageImageDimensionsError("hero_desktop", 1600, 900)).toBeNull();
    expect(pageImageDimensionsError("hero_mobile", 900, 1600)).toBeNull();
    expect(pageImageDimensionsError("hero_mobile", 4000, 3000)).toBeNull();
  });

  it("checks both axes of the visible composition without upscaling", () => {
    expect(pageImageDimensionsError("hero_desktop", 4000, 800)).toContain(
      "1600 x 900",
    );
    expect(pageImageDimensionsError("hero_mobile", 4000, 1500)).toContain(
      "900 x 1600",
    );
    expect(pageImageDimensionsError("hero_mobile", 800, 4000)).toContain(
      "900 x 1600",
    );
  });

  it("enforces optimizer dimensions for every slot", () => {
    expect(pageImageDimensionsError("venue", 8192, 4096)).toBeNull();
    expect(pageImageDimensionsError("story_primary", 8193, 4096)).toContain(
      "8192",
    );
    expect(pageImageDimensionsError("venue", NaN, 100)).not.toBeNull();
    expect(pageImageDimensionsError("venue", 100, 0)).not.toBeNull();
  });

  it("budgets for the cover-scaled source, including tall phone viewports", () => {
    expect(heroImageSizes(1600, 900)).toBe("max(100vw, 163.556svh)");
    expect(heroImageSizes(900, 1600)).toBe("max(100vw, 51.75svh)");
  });
});
