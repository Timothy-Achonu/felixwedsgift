import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  createClient: vi.fn(),
  updateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock("@/lib/auth/admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createClient,
}));
vi.mock("next/cache", () => ({
  updateTag: mocks.updateTag,
  revalidatePath: mocks.revalidatePath,
}));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
}));

import {
  deleteScheduleItem,
  moveScheduleItem,
  saveScheduleItem,
  saveWeddingSettings,
} from "./actions";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

function database(errors: (object | null)[] = [null]) {
  const write = vi.fn();
  for (const error of errors) write.mockResolvedValueOnce({ error });
  const query = {
    upsert: write,
    insert: write,
    update: () => ({ eq: write }),
    delete: () => ({ eq: write }),
  };
  mocks.createClient.mockResolvedValue({ from: () => query });
  return write;
}

function expectInvalidation() {
  expect(mocks.updateTag).toHaveBeenCalledWith("wedding-content");
  expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
  expect(mocks.revalidatePath).toHaveBeenCalledWith("/gallery");
}

describe("admin content cache invalidation", () => {
  beforeEach(() => vi.resetAllMocks());

  it.each([true, false])(
    "invalidates settings and publication changes (published=%s)",
    async (published) => {
      database();
      const values = Object.fromEntries(
        [
          "partner_one_name",
          "partner_two_name",
          "timezone",
          "ceremony_time",
          "reception_time",
          "venue_name",
          "venue_address",
          "dress_code",
          "directions_url",
          "hero_eyebrow",
          "hero_message",
          "story_heading",
          "story_introduction",
          "story_body",
          "details_heading",
        ].map((key) => [key, "Wedding detail"]),
      );
      const data = form({
        ...values,
        wedding_date: "2026-12-18T14:00:00Z",
        ...(published ? { is_published: "on" } : {}),
      });
      await expect(saveWeddingSettings({}, data)).rejects.toThrow(
        "redirect:/admin/details?saved=1",
      );
      expectInvalidation();
    },
  );

  it.each(["", "existing-item"])(
    "invalidates schedule insert/update (%s)",
    async (id) => {
      database();
      await expect(
        saveScheduleItem(
          {},
          form({ id, title: "Ceremony", time_label: "2 PM" }),
        ),
      ).rejects.toThrow("redirect:/admin/schedule?saved=1");
      expectInvalidation();
    },
  );

  it("invalidates a successful deletion", async () => {
    database();
    await expect(deleteScheduleItem(form({ id: "item" }))).rejects.toThrow(
      "deleted=1",
    );
    expectInvalidation();
  });

  it.each([
    [null, null],
    [null, { message: "failed" }],
    [{ message: "failed" }, null],
  ])(
    "invalidates reorder writes even if one fails: %j, %j",
    async (first, second) => {
      database([first, second]);
      await expect(
        moveScheduleItem(
          form({
            id: "a",
            adjacent_id: "b",
            direction: "up",
            sort_order: "2",
            adjacent_sort_order: "1",
          }),
        ),
      ).rejects.toThrow("redirect:/admin/schedule?");
      expectInvalidation();
    },
  );

  it("does not invalidate failed or invalid saves", async () => {
    database([{ message: "failed" }]);
    expect(
      await saveScheduleItem(
        {},
        form({ title: "Ceremony", time_label: "2 PM" }),
      ),
    ).toHaveProperty("error");
    expect(await saveScheduleItem({}, form({}))).toHaveProperty("error");
    expect(await saveWeddingSettings({}, form({}))).toHaveProperty("error");
    expect(mocks.updateTag).not.toHaveBeenCalled();
  });

  it("does not mutate or invalidate when authorization fails", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("unauthorized"));
    await expect(deleteScheduleItem(form({ id: "item" }))).rejects.toThrow(
      "unauthorized",
    );
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.updateTag).not.toHaveBeenCalled();
  });
});
