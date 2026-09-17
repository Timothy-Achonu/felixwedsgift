import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isSupabaseConfigured: vi.fn(),
  createSupabasePublicClient: vi.fn(),
  getApprovedPhotos: vi.fn(),
}));

vi.mock("@/lib/supabase/config", () => ({
  isSupabaseConfigured: mocks.isSupabaseConfigured,
}));

vi.mock("@/lib/supabase/public", () => ({
  createSupabasePublicClient: mocks.createSupabasePublicClient,
}));

vi.mock("@/lib/photos/public", () => ({
  getApprovedPhotos: mocks.getApprovedPhotos,
}));

import { getWeddingContent } from "./wedding";
import { mockWeddingContent } from "./mock-wedding";

describe("wedding content adapter", () => {
  it("uses the mock content when Supabase is not configured", async () => {
    mocks.isSupabaseConfigured.mockReturnValue(false);

    const wedding = await getWeddingContent();

    expect(wedding.isMock).toBe(true);
    expect(mocks.createSupabasePublicClient).not.toHaveBeenCalled();
  });

  it("maps published settings and ordered schedule rows", async () => {
    mocks.isSupabaseConfigured.mockReturnValue(true);
    mocks.getApprovedPhotos.mockResolvedValue({ photos: [], nextCursor: null });

    const settingsQuery = {
      select: vi.fn(),
      eq: vi.fn(),
      maybeSingle: vi.fn(),
    };
    const scheduleQuery = {
      select: vi.fn(),
      order: vi.fn(),
      returns: vi.fn(),
    };
    const pageImagesQuery = {
      select: vi.fn(),
      returns: vi.fn(),
    };

    settingsQuery.select.mockReturnValue(settingsQuery);
    settingsQuery.eq.mockReturnValue(settingsQuery);
    settingsQuery.maybeSingle.mockResolvedValue({
      data: {
        partner_one_name: "Felix",
        partner_two_name: "Gift",
        wedding_date: "2026-12-18T14:00:00+01:00",
        timezone: "Africa/Lagos",
        ceremony_time: "2:00 PM",
        reception_time: "4:30 PM",
        venue_name: "The Garden Estate",
        venue_address: "Lagos, Nigeria",
        dress_code: "Formal",
        directions_url: "https://example.com/directions",
        hero_eyebrow: "With full hearts",
        hero_message: "We are getting married",
        story_heading: "We found home in each other.",
        story_introduction: "An introduction.",
        story_body: "A story.",
        details_heading: "Join us in Lagos",
      },
      error: null,
    });

    scheduleQuery.select.mockReturnValue(scheduleQuery);
    scheduleQuery.order.mockReturnValue(scheduleQuery);
    scheduleQuery.returns.mockResolvedValue({
      data: [
        {
          id: "schedule-1",
          time_label: "2:00 PM",
          title: "Ceremony",
          description: "The vows.",
        },
      ],
      error: null,
    });
    pageImagesQuery.select.mockReturnValue(pageImagesQuery);
    pageImagesQuery.returns.mockResolvedValue({
      data: [
        {
          slot: "hero_desktop",
          cloudinary_public_id: "wedding/page/example",
          secure_url:
            "https://res.cloudinary.com/example/image/upload/hero.jpg",
          alt: "A couple beside each other",
          width: 1600,
          height: 900,
          focal_x: 0.5,
          focal_y: 0.5,
        },
      ],
      error: null,
    });

    mocks.createSupabasePublicClient.mockReturnValue({
      from: vi.fn((table: string) =>
        table === "wedding_settings"
          ? settingsQuery
          : table === "schedule_items"
            ? scheduleQuery
            : pageImagesQuery,
      ),
    });

    const wedding = await getWeddingContent();

    expect(wedding.isMock).toBe(false);
    expect(wedding.weddingDateLabel).toBe("18 December 2026");
    expect(wedding.story.heading).toBe("We found home in each other.");
    expect(wedding.details.heading).toBe("Join us in Lagos");
    expect(wedding.hero.image.src).toBe(
      "https://res.cloudinary.com/example/image/upload/hero.jpg",
    );
    expect(wedding.hero.mobileImage.src).toBe(
      mockWeddingContent.hero.mobileImage.src,
    );
    expect(wedding.schedule).toEqual([
      {
        id: "schedule-1",
        time: "2:00 PM",
        title: "Ceremony",
        description: "The vows.",
      },
    ]);
  });

  it("returns not found after unpublishing instead of retaining an old ISR page", async () => {
    mocks.isSupabaseConfigured.mockReturnValue(true);
    const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.maybeSingle.mockResolvedValue({ data: null, error: null });
    mocks.createSupabasePublicClient.mockReturnValue({ from: () => query });
    await expect(getWeddingContent()).rejects.toThrow(
      "NEXT_HTTP_ERROR_FALLBACK;404",
    );
  });
});
