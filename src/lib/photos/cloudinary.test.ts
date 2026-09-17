import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  config: vi.fn(),
  apiSignRequest: vi.fn().mockReturnValue("signed"),
}));

vi.mock("@/env", () => ({
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "wedding-cloud",
    CLOUDINARY_API_KEY: "api-key",
    CLOUDINARY_API_SECRET: "api-secret",
  },
}));

vi.mock("cloudinary", () => ({
  v2: {
    config: mocks.config,
    utils: { api_sign_request: mocks.apiSignRequest },
  },
}));

import { signGuestPhotoUpload } from "./cloudinary";

describe("guest photo Cloudinary authorization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("signs authenticated delivery as an upload parameter", () => {
    const authorization = signGuestPhotoUpload(
      "wedding/guest/00000000-0000-4000-8000-000000000001",
    );

    expect(mocks.apiSignRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        overwrite: false,
        type: "authenticated",
      }),
      "api-secret",
    );
    expect(authorization).toMatchObject({
      cloudName: "wedding-cloud",
      apiKey: "api-key",
      type: "authenticated",
      signature: "signed",
    });
  });
});
