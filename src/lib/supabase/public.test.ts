import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./config", () => ({
  getSupabaseConfig: () => ({
    url: "https://wedding.supabase.co",
    publishableKey: "public-test-key",
  }),
}));

import { createSupabasePublicClient } from "./public";

afterEach(() => vi.restoreAllMocks());

describe("anonymous public content fetches", () => {
  it("tags all public content reads without forwarding a browser session", async () => {
    const request = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => Response.json([]));
    const client = createSupabasePublicClient();
    for (const table of ["wedding_settings", "schedule_items", "page_images"]) {
      await client.from(table).select("*");
    }
    expect(request).toHaveBeenCalledTimes(3);
    for (const [, options] of request.mock.calls) {
      expect(options).toMatchObject({
        cache: "force-cache",
        next: { tags: ["wedding-content"], revalidate: 3600 },
      });
      const headers = new Headers(options?.headers);
      expect(headers.get("cookie")).toBeNull();
      expect(headers.get("authorization")).toBe("Bearer public-test-key");
    }
  });

  it("does not cache mutations or reads of other tables", async () => {
    const request = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => Response.json([]));
    const client = createSupabasePublicClient();
    await client.from("admin_members").select("*");
    await client.from("page_images").insert({ slot: "venue" });
    for (const [, options] of request.mock.calls) {
      expect(options?.cache).toBe("no-store");
      expect(options).not.toHaveProperty("next");
    }
  });
});
