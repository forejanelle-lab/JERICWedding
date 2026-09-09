import Link from "next/link";
import type { GuestRegion } from "@/lib/types/database";
import { formatDate, formatRegion } from "@/lib/portal/constants";

type GuestProfileCardProps = {
  displayName: string;
  region: GuestRegion;
  homeCity?: string | null;
  arrivalDate?: string | null;
  departureDate?: string | null;
  bio?: string | null;
  highlight?: boolean;
};

export function GuestProfileCard({
  displayName,
  region,
  homeCity,
  arrivalDate,
  departureDate,
  bio,
  highlight = false,
}: GuestProfileCardProps) {
  return (
    <article
      className={`border p-6 transition-colors ${
        highlight
          ? "border-gold/40 bg-cream"
          : "border-taupe/20 bg-ivory hover:border-taupe/40"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-light tracking-[0.06em] text-charcoal uppercase">
            {displayName}
          </h3>
          {homeCity && (
            <p className="mt-1 font-sans text-sm text-charcoal/60">{homeCity}</p>
          )}
        </div>
        <span className="shrink-0 border border-olive/20 px-3 py-1 font-sans text-[0.55rem] uppercase tracking-[0.2em] text-olive">
          {formatRegion(region)}
        </span>
      </div>

      {(arrivalDate || departureDate) && (
        <p className="mt-4 font-sans text-xs uppercase tracking-[0.15em] text-taupe">
          In Italy {formatDate(arrivalDate)} – {formatDate(departureDate)}
        </p>
      )}

      {bio && (
        <p className="mt-4 font-sans text-sm leading-relaxed text-charcoal/70">
          {bio}
        </p>
      )}
    </article>
  );
}

export function PortalEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="border border-dashed border-taupe/25 px-8 py-16 text-center">
      <p className="font-serif text-xl font-light tracking-[0.08em] text-charcoal uppercase">
        {title}
      </p>
      <p className="mx-auto mt-4 max-w-md font-sans text-sm leading-relaxed text-charcoal/60">
        {description}
      </p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-8 inline-block border border-charcoal/20 px-6 py-3 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-charcoal transition-colors hover:border-charcoal"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export function PortalPageHeader({
  title,
  script,
  description,
}: {
  title: string;
  script?: string;
  description?: string;
}) {
  return (
    <div className="mb-12 max-w-2xl">
      {script && (
        <p className="font-script text-xl italic text-taupe md:text-2xl">{script}</p>
      )}
      <h1 className="mt-2 font-serif text-3xl font-light tracking-[0.1em] text-charcoal uppercase md:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-4 font-sans text-base leading-relaxed text-charcoal/70">
          {description}
        </p>
      )}
    </div>
  );
}
