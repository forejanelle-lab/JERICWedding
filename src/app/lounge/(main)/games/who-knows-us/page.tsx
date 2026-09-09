import Link from "next/link";
import { getLoungeSession } from "@/lib/lounge/auth";
import { WhoKnowsUsQuiz } from "@/components/lounge/WhoKnowsUsQuiz";

export default async function WhoKnowsUsPage() {
  const session = await getLoungeSession();

  return (
    <div>
      <Link
        href="/lounge/games"
        className="font-sans text-[0.65rem] uppercase tracking-[0.25em] text-taupe transition-colors hover:text-charcoal"
      >
        ← Back to Games
      </Link>
      <div className="mt-8">
        <WhoKnowsUsQuiz guestName={session?.guestName ?? "Guest"} />
      </div>
    </div>
  );
}
