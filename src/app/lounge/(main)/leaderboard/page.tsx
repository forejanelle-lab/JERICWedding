import Link from "next/link";
import { LoungePageHeader } from "@/components/lounge/LoungePageHeader";
import { LEADERBOARD } from "@/lib/lounge/constants";

export default function LoungeLeaderboardPage() {
  return (
    <div>
      <LoungePageHeader
        title="Leaderboard"
        script="Connection over popularity"
        description="Points reward participation — quizzes, polls, meeting new guests, and completing challenges. Hide your rank anytime."
      />

      <div className="overflow-hidden border border-taupe/20 bg-ivory">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-taupe/15 font-sans text-[0.6rem] uppercase tracking-[0.2em] text-taupe">
              <th className="px-6 py-4">Rank</th>
              <th className="px-6 py-4">Guest</th>
              <th className="px-6 py-4 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {LEADERBOARD.map((entry) => (
              <tr key={entry.rank} className="border-b border-taupe/10 last:border-0">
                <td className="px-6 py-4 font-serif text-xl text-charcoal">{entry.rank}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center border border-taupe/20 bg-cream font-serif text-lg text-olive">
                      {entry.avatar}
                    </span>
                    <span className="font-sans text-sm text-charcoal">{entry.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-sans text-sm text-taupe">
                  {entry.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 font-sans text-sm text-taupe">
        Quiz completed +50 · Poll +10 · Meet a guest +50 · Challenge +50 · Help answer +25
      </p>

      <Link
        href="/lounge/games"
        className="mt-8 inline-block font-sans text-[0.65rem] uppercase tracking-[0.25em] text-taupe hover:text-charcoal"
      >
        Earn more points →
      </Link>
    </div>
  );
}
