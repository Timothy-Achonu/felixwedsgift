import type { WeddingLifecycle } from "@/types/wedding";

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function dateKey(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function getWeddingLifecycle(
  weddingDate: string,
  timezone: string,
  now = new Date(),
): WeddingLifecycle {
  const wedding = new Date(weddingDate);
  const currentKey = dateKey(now, timezone);
  const weddingKey = dateKey(wedding, timezone);

  if (currentKey < weddingKey) return "upcoming";
  if (currentKey === weddingKey) return "today";
  return "complete";
}

export function getCountdown(weddingDate: string, now = new Date()): Countdown {
  const remaining = Math.max(
    0,
    new Date(weddingDate).getTime() - now.getTime(),
  );

  return {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining / 3_600_000) % 24),
    minutes: Math.floor((remaining / 60_000) % 60),
    seconds: Math.floor((remaining / 1_000) % 60),
  };
}
