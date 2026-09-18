import { describe, expect, it } from "vitest";

import { runWithConcurrency } from "./run-with-concurrency";

describe("runWithConcurrency", () => {
  it("runs all work without exceeding the concurrency limit", async () => {
    let active = 0;
    let peak = 0;
    const seen: number[] = [];

    await runWithConcurrency([1, 2, 3, 4, 5], 2, async (value) => {
      active += 1;
      peak = Math.max(peak, active);
      seen.push(value);
      await Promise.resolve();
      active -= 1;
    });

    expect(seen.sort((left, right) => left - right)).toEqual([1, 2, 3, 4, 5]);
    expect(peak).toBeLessThanOrEqual(2);
  });
});
