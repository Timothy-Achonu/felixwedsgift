"use client";

import { useEffect, useMemo, useState } from "react";

import { getCountdown, getWeddingLifecycle } from "@/lib/wedding/lifecycle";

type CountdownProps = {
  weddingDate: string;
  timezone: string;
  weddingDateLabel: string;
};

const units = ["days", "hours", "minutes", "seconds"] as const;

export function WeddingCountdown({
  weddingDate,
  timezone,
  weddingDateLabel,
}: CountdownProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const initialFrame = window.requestAnimationFrame(() => setNow(new Date()));
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.clearInterval(timer);
    };
  }, []);

  const lifecycle = useMemo(
    () => (now ? getWeddingLifecycle(weddingDate, timezone, now) : "upcoming"),
    [now, timezone, weddingDate],
  );
  const countdown = useMemo(
    () => getCountdown(weddingDate, now ?? new Date(weddingDate)),
    [now, weddingDate],
  );

  if (lifecycle === "today") {
    return (
      <div className="countdown-message" role="status">
        <p className="eyebrow">18 December</p>
        <p className="font-display">Today is the day.</p>
        <span>Felix &amp; Gift are getting married today.</span>
      </div>
    );
  }

  if (lifecycle === "complete") {
    return (
      <div className="countdown-message" role="status">
        <p className="eyebrow">A new chapter</p>
        <p className="font-display">We said &quot;I do.&quot;</p>
        <a href="#gallery" className="text-link focus-ring">
          Visit the wedding album
        </a>
      </div>
    );
  }

  const accessibleLabel = units
    .map((unit) => `${countdown[unit]} ${unit}`)
    .join(", ");

  return (
    <div className="countdown-grid" aria-label={accessibleLabel}>
      {units.map((unit) => (
        <div key={unit} className="countdown-unit">
          <span aria-hidden="true" className="countdown-value">
            {String(countdown[unit]).padStart(unit === "days" ? 3 : 2, "0")}
          </span>
          <span aria-hidden="true" className="countdown-label">
            {unit}
          </span>
        </div>
      ))}
      <p className="sr-only">Wedding date: {weddingDateLabel}</p>
    </div>
  );
}
