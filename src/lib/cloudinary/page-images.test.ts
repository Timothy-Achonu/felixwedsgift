import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/env", () => ({
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "example-cloud",
    CLOUDINARY_API_KEY: "example-key",
    CLOUDINARY_API_SECRET: "example-secret",
  },
}));

import { signedPageImageUpload, verifyPageImage } from "./page-images";

describe("Cloudinary page-image requests", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("signs only the exact fields returned for the browser upload", () => {
    const signed = signedPageImageUpload();
    const expected = createHash("sha1")
      .update(
        `overwrite=false&public_id=${signed.public_id}&timestamp=${signed.timestamp}example-secret`,
      )
      .digest("hex");

    expect(signed.public_id).toMatch(/^wedding\/page\/[0-9a-f-]{36}$/);
    expect(signed.signature).toBe(expected);
    expect(signed).not.toHaveProperty("apiSecret");
  });

  it("refuses foreign public IDs before looking up an asset", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(verifyPageImage("someone-else/photo")).rejects.toThrow(
      "Invalid page-image asset ID",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
