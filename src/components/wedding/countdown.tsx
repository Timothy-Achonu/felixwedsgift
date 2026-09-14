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
      <div className="w-full max-w-[780px] py-4" role="status">
        <p className="eyebrow">18 December</p>
        <p className="wedding-display my-2 text-[3.5rem] leading-none">
          Today is the day.
        </p>
        <span>Felix &amp; Gift are getting married today.</span>
      </div>
    );
  }

  if (lifecycle === "complete") {
    return (
      <div className="w-full max-w-[780px] py-4" role="status">
        <p className="eyebrow">A new chapter</p>
        <p className="wedding-display my-2 text-[3.5rem] leading-none">
          We said &quot;I do.&quot;
        </p>
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
    <div
      className="border-wedding-navy/[34%] grid w-full max-w-[800px] grid-cols-4 border-y"
      aria-label={accessibleLabel}
    >
      {units.map((unit) => (
        <div
          key={unit}
          className="border-wedding-navy/[34%] grid min-w-0 place-items-center gap-[0.35rem] border-r px-[0.2rem] py-[1.4rem] last:border-r-0"
        >
          <span
            aria-hidden="true"
            className="wedding-display-quiet text-[2.35rem] leading-none tabular-nums sm:text-[3.5rem]"
          >
            {String(countdown[unit]).padStart(unit === "days" ? 3 : 2, "0")}
          </span>
          <span
            aria-hidden="true"
            className="text-[0.58rem] font-[750] uppercase sm:text-[0.66rem]"
          >
            {unit}
          </span>
        </div>
      ))}
      <p className="sr-only">Wedding date: {weddingDateLabel}</p>
    </div>
  );
}
