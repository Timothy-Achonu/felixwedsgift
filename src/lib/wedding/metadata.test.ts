import { describe, expect, it } from "vitest";

import { mockWeddingContent } from "@/data/mock-wedding";

import { getPublicWeddingMetadata } from "./metadata";

describe("public wedding metadata", () => {
  it("uses the configured couple, date, and venue values", () => {
    const wedding = {
      ...mockWeddingContent,
      couple: {
        partnerOne: "Ada",
        partnerTwo: "Bayo",
      },
      weddingDateLabel: "7 July 2027",
      details: {
        ...mockWeddingContent.details,
        venueAddress: "Abuja, Nigeria",
      },
    };

    expect(getPublicWeddingMetadata(wedding, "home")).toEqual({
      title: "Ada & Bayo | 7 July 2027",
      description:
        "Join Ada and Bayo for a joyful wedding celebration in Abuja, Nigeria.",
    });
    expect(getPublicWeddingMetadata(wedding, "gallery")).toEqual({
      title: "Wedding Gallery | Ada & Bayo",
      description: "Photographs from Ada and Bayo's wedding celebration.",
    });
  });
});
