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

  const publicId = "wedding/page/12345678-1234-1234-1234-123456789abc";
  const asset = {
    public_id: publicId,
    secure_url: `https://res.cloudinary.com/example-cloud/image/upload/v1/${publicId}.jpg`,
    width: 4000,
    height: 3000,
    format: "jpg",
    bytes: 5_000_000,
  };

  it("verifies original dimensions, format and bytes with an uncached provider read", async () => {
    const request = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(Response.json(asset));
    await expect(verifyPageImage(publicId)).resolves.toMatchObject({
      width: 4000,
      height: 3000,
      format: "jpg",
      bytes: 5_000_000,
    });
    expect(request.mock.calls[0][1]?.cache).toBe("no-store");
  });

  it.each([
    { format: "svg" },
    { format: "gif" },
    { bytes: 10_000_001 },
    { bytes: 0 },
    { bytes: undefined },
    { width: 1.5 },
  ])("rejects unsupported provider metadata: %j", async (invalid) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ ...asset, ...invalid }),
    );
    await expect(verifyPageImage(publicId)).rejects.toThrow(
      "unexpected image asset",
    );
  });
});
