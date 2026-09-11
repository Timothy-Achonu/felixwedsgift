import { describe, expect, it } from "vitest";

import { getCountdown, getWeddingLifecycle } from "@/lib/wedding/lifecycle";

const weddingDate = "2026-12-18T14:00:00+01:00";
const timezone = "Africa/Lagos";

describe("wedding lifecycle", () => {
  it("returns the upcoming state before the wedding date in Lagos", () => {
    expect(
      getWeddingLifecycle(
        weddingDate,
        timezone,
        new Date("2026-12-17T22:59:59Z"),
      ),
    ).toBe("upcoming");
  });

  it("returns the wedding-day state for the full local calendar day", () => {
    expect(
      getWeddingLifecycle(
        weddingDate,
        timezone,
        new Date("2026-12-17T23:00:00Z"),
      ),
    ).toBe("today");
    expect(
      getWeddingLifecycle(
        weddingDate,
        timezone,
        new Date("2026-12-18T22:59:59Z"),
      ),
    ).toBe("today");
  });

  it("returns the complete state after the local wedding day", () => {
    expect(
      getWeddingLifecycle(
        weddingDate,
        timezone,
        new Date("2026-12-18T23:00:00Z"),
      ),
    ).toBe("complete");
  });

  it("calculates stable countdown units", () => {
    expect(getCountdown(weddingDate, new Date("2026-12-17T12:00:00Z"))).toEqual(
      {
        days: 1,
        hours: 1,
        minutes: 0,
        seconds: 0,
      },
    );
  });
});
