"use client";

import type { GuestRegion } from "@/lib/types/database";
import { REGION_FILTER_OPTIONS } from "@/lib/portal/constants";

type RegionFilterProps = {
  value: GuestRegion | "all";
  onChange: (value: GuestRegion | "all") => void;
  name?: string;
};

export function RegionFilter({ value, onChange, name = "region" }: RegionFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by region">
      {REGION_FILTER_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          name={name}
          onClick={() => onChange(option.value)}
          className={`border px-4 py-2 font-sans text-[0.6rem] uppercase tracking-[0.2em] transition-colors ${
            value === option.value
              ? "border-charcoal bg-charcoal text-ivory"
              : "border-taupe/25 text-taupe hover:border-charcoal hover:text-charcoal"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function RegionFilterLinks({
  basePath,
  current,
}: {
  basePath: string;
  current: GuestRegion | "all";
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {REGION_FILTER_OPTIONS.map((option) => {
        const href =
          option.value === "all"
            ? basePath
            : `${basePath}?region=${option.value}`;
        const active = current === option.value;
        return (
          <a
            key={option.value}
            href={href}
            className={`border px-4 py-2 font-sans text-[0.6rem] uppercase tracking-[0.2em] transition-colors ${
              active
                ? "border-charcoal bg-charcoal text-ivory"
                : "border-taupe/25 text-taupe hover:border-charcoal hover:text-charcoal"
            }`}
          >
            {option.label}
          </a>
        );
      })}
    </div>
  );
}
