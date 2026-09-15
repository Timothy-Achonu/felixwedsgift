import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAdminIdentity: vi.fn(),
  signedPageImageUpload: vi.fn(),
}));

vi.mock("@/lib/auth/admin", () => ({
  getAdminIdentity: mocks.getAdminIdentity,
}));
vi.mock("@/lib/cloudinary/page-images", () => ({
  signedPageImageUpload: mocks.signedPageImageUpload,
}));

import { POST } from "./route";

describe("admin page-image signing", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not issue a Cloudinary signature to a non-admin", async () => {
    mocks.getAdminIdentity.mockResolvedValue(null);

    const response = await POST();

    expect(response.status).toBe(403);
    expect(mocks.signedPageImageUpload).not.toHaveBeenCalled();
  });

  it("issues signed parameters to an admin", async () => {
    mocks.getAdminIdentity.mockResolvedValue({
      id: "admin",
      email: "admin@example.com",
    });
    mocks.signedPageImageUpload.mockReturnValue({
      signature: "example",
      public_id: "wedding/page/example",
    });

    const response = await POST();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      signature: "example",
      public_id: "wedding/page/example",
    });
  });
});
