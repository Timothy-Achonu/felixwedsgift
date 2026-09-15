import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAdminIdentity: vi.fn(),
  createSupabaseServerClient: vi.fn(),
  verifyPageImage: vi.fn(),
  destroyPageImage: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/admin", () => ({
  getAdminIdentity: mocks.getAdminIdentity,
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));
vi.mock("@/lib/cloudinary/page-images", () => ({
  verifyPageImage: mocks.verifyPageImage,
  destroyPageImage: mocks.destroyPageImage,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { DELETE, POST } from "./route";

const publicId = "wedding/page/12345678-1234-1234-1234-123456789abc";
const secureUrl =
  "https://res.cloudinary.com/test/image/upload/v1/wedding/page/hero.jpg";

function saveRequest(expectedPublicId = "") {
  return new Request("http://localhost/api/admin/page-images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slot: "hero_desktop",
      publicId,
      expectedPublicId,
      alt: "A couple together",
      focalX: 0.5,
      focalY: 0.5,
    }),
  });
}

describe("admin page-image persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdminIdentity.mockResolvedValue({
      id: "admin",
      email: "admin@example.com",
    });
    mocks.verifyPageImage.mockResolvedValue({
      publicId,
      secureUrl,
      width: 1600,
      height: 900,
    });
  });

  it("refuses writes without an admin identity", async () => {
    mocks.getAdminIdentity.mockResolvedValue(null);

    expect((await POST(saveRequest())).status).toBe(403);
    expect(
      (await DELETE(new Request("http://localhost", { method: "DELETE" })))
        .status,
    ).toBe(403);
    expect(mocks.verifyPageImage).not.toHaveBeenCalled();
  });

  it("rejects a non-object request body without reaching the database", async () => {
    const response = await POST(
      new Request("http://localhost/api/admin/page-images", {
        method: "POST",
        body: "null",
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("saves a provider-verified asset in an empty slot", async () => {
    const read = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
    const write = { insert: vi.fn(), select: vi.fn(), maybeSingle: vi.fn() };
    read.select.mockReturnValue(read);
    read.eq.mockReturnValue(read);
    read.maybeSingle.mockResolvedValue({ data: null, error: null });
    write.insert.mockReturnValue(write);
    write.select.mockReturnValue(write);
    write.maybeSingle.mockResolvedValue({
      data: { slot: "hero_desktop" },
      error: null,
    });
    mocks.createSupabaseServerClient.mockResolvedValue({
      from: vi.fn().mockReturnValueOnce(read).mockReturnValueOnce(write),
    });

    const response = await POST(saveRequest());

    expect(response.status).toBe(200);
    expect(mocks.verifyPageImage).toHaveBeenCalledWith(publicId);
    expect(write.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        slot: "hero_desktop",
        cloudinary_public_id: publicId,
        secure_url: secureUrl,
        alt: "A couple together",
      }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(mocks.destroyPageImage).not.toHaveBeenCalled();
  });

  it("rejects stale editors before checking a new Cloudinary asset", async () => {
    const read = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
    read.select.mockReturnValue(read);
    read.eq.mockReturnValue(read);
    read.maybeSingle.mockResolvedValue({
      data: {
        cloudinary_public_id: "wedding/page/newer",
        secure_url: secureUrl,
        width: 1600,
        height: 900,
      },
      error: null,
    });
    mocks.createSupabaseServerClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(read),
    });

    const response = await POST(saveRequest("wedding/page/older"));

    expect(response.status).toBe(409);
    expect(mocks.verifyPageImage).not.toHaveBeenCalled();
    expect(mocks.destroyPageImage).not.toHaveBeenCalled();
  });

  it("rejects a hero upload that missed the finished crop dimensions", async () => {
    const read = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
    read.select.mockReturnValue(read);
    read.eq.mockReturnValue(read);
    read.maybeSingle.mockResolvedValue({ data: null, error: null });
    mocks.createSupabaseServerClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(read),
    });
    mocks.verifyPageImage.mockResolvedValue({
      publicId,
      secureUrl,
      width: 2000,
      height: 1600,
    });

    const response = await POST(saveRequest());

    expect(response.status).toBe(400);
    expect(mocks.destroyPageImage).not.toHaveBeenCalled();
  });

  it("requires the desktop hero before saving a phone crop", async () => {
    const emptyQuery = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
    emptyQuery.select.mockReturnValue(emptyQuery);
    emptyQuery.eq.mockReturnValue(emptyQuery);
    emptyQuery.maybeSingle.mockResolvedValue({ data: null, error: null });
    mocks.createSupabaseServerClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(emptyQuery),
    });

    const request = new Request("http://localhost/api/admin/page-images", {
      method: "POST",
      body: JSON.stringify({
        slot: "hero_mobile",
        publicId,
        expectedPublicId: "",
        alt: "A couple together",
        focalX: 0.5,
        focalY: 0.5,
      }),
    });
    const response = await POST(request);

    expect(response.status).toBe(409);
    expect(mocks.verifyPageImage).not.toHaveBeenCalled();
  });

  it("does not clean up an asset while it is still referenced", async () => {
    const query = { select: vi.fn(), eq: vi.fn(), limit: vi.fn() };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.limit.mockResolvedValue({
      data: [{ slot: "hero_desktop" }],
      error: null,
    });
    mocks.createSupabaseServerClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(query),
    });

    const response = await DELETE(
      new Request("http://localhost", {
        method: "DELETE",
        body: JSON.stringify({ publicId }),
      }),
    );

    expect(response.status).toBe(409);
    expect(mocks.destroyPageImage).not.toHaveBeenCalled();
  });
});
