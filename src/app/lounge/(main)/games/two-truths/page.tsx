import Link from "next/link";
import { LoungePageHeader } from "@/components/lounge/LoungePageHeader";
import { LoungeComingSoon } from "@/components/lounge/LoungeComingSoon";

export default function TwoTruthsPage() {
  return (
    <div>
      <Link
        href="/lounge/games"
        className="font-sans text-[0.65rem] uppercase tracking-[0.25em] text-taupe hover:text-charcoal"
      >
        ← Back to Games
      </Link>
      <div className="mt-8">
        <LoungeComingSoon
          title="Two Truths & a Lie"
          description="Submit three statements about yourself. Other guests guess the lie — one of the best ways to meet people before the wedding."
          points={50}
        />
      </div>
    </div>
  );
}
