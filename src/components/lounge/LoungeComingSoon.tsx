import Link from "next/link";
import type { ReactNode } from "react";

type LoungeComingSoonProps = {
  title: string;
  description: string;
  points?: number;
  children?: ReactNode;
};

export function LoungeComingSoon({
  title,
  description,
  points,
  children,
}: LoungeComingSoonProps) {
  return (
    <div className="border border-taupe/20 bg-ivory p-8 md:p-12">
      <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-olive">
        Coming Soon
      </p>
      <h1 className="mt-4 font-serif text-3xl font-light tracking-[0.08em] text-charcoal uppercase">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-charcoal/70">
        {description}
      </p>
      {points && (
        <p className="mt-4 font-sans text-sm text-gold">+{points} points when live</p>
      )}
      {children}
      <Link
        href="/lounge/games"
        className="mt-8 inline-block font-sans text-[0.65rem] uppercase tracking-[0.25em] text-taupe hover:text-charcoal"
      >
        ← Back to Games
      </Link>
    </div>
  );
}
