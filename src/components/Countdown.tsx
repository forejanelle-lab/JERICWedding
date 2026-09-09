"use client";

import { useEffect, useState } from "react";
import { WEDDING } from "@/lib/hub/content";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(): TimeLeft {
  const diff = Math.max(0, new Date(WEDDING.dateISO).getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function Countdown({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  const numberClass =
    tone === "dark"
      ? "text-ivory"
      : "text-charcoal";
  const labelClass = tone === "dark" ? "text-ivory/55" : "text-taupe";
  const divide = tone === "dark" ? "divide-ivory/20" : "divide-taupe/20";

  if (!timeLeft) {
    return <div className="h-20 w-full max-w-lg animate-pulse bg-taupe/10" aria-hidden="true" />;
  }

  return (
    <div className={`flex flex-wrap items-center justify-center divide-x ${divide}`} role="timer" aria-label="Countdown to wedding">
      {(
        [
          [timeLeft.days, "Days"],
          [timeLeft.hours, "Hours"],
          [timeLeft.minutes, "Minutes"],
          [timeLeft.seconds, "Seconds"],
        ] as const
      ).map(([value, label]) => (
        <div key={label} className="flex min-w-[4.5rem] flex-col items-center gap-2 px-4 md:min-w-[6rem] md:px-7">
          <span
            key={`${label}-${value}`}
            className={`tick-in font-serif text-4xl font-light tabular-nums md:text-5xl lg:text-6xl ${numberClass}`}
          >
            {String(value).padStart(2, "0")}
          </span>
          <span className={`font-sans text-[0.58rem] uppercase tracking-[0.28em] ${labelClass}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}
