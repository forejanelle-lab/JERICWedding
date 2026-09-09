import Link from "next/link";
import { LoungePageHeader } from "@/components/lounge/LoungePageHeader";
import { SCAVENGER_CHALLENGES, SECRET_MISSIONS } from "@/lib/lounge/constants";

export default function LoungeChallengesPage() {
  const completed = SCAVENGER_CHALLENGES.filter((c) => c.completed).length;

  return (
    <div>
      <LoungePageHeader
        title="Challenges"
        script="Weekend scavenger hunt"
        description="Complete tasks to earn points and meet people — connection over competition."
      />

      <div className="mb-10 border border-taupe/15 bg-ivory p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-olive">
              Progress
            </p>
            <p className="mt-2 font-serif text-3xl text-charcoal">
              {completed} / {SCAVENGER_CHALLENGES.length}
            </p>
          </div>
          <div className="h-2 w-full max-w-xs bg-taupe/15">
            <div
              className="h-2 bg-olive transition-all"
              style={{
                width: `${(completed / SCAVENGER_CHALLENGES.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-olive">
            Scavenger Hunt
          </h2>
          <ul className="space-y-3">
            {SCAVENGER_CHALLENGES.map((challenge) => (
              <li
                key={challenge.id}
                className="flex items-start gap-4 border border-taupe/15 bg-ivory p-4"
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 items-center justify-center border text-[0.65rem] ${
                    challenge.completed
                      ? "border-olive bg-olive text-ivory"
                      : "border-taupe/30 text-transparent"
                  }`}
                  aria-hidden="true"
                >
                  ✓
                </span>
                <div className="flex-1">
                  <p className="font-sans text-sm text-charcoal/80">{challenge.label}</p>
                  <p className="mt-1 font-sans text-xs text-gold">+{challenge.points} points</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-olive">
            Secret Missions
          </h2>
          <ul className="space-y-3">
            {SECRET_MISSIONS.map((mission) => (
              <li
                key={mission.id}
                className="flex items-start justify-between gap-4 border border-taupe/15 bg-ivory p-4"
              >
                <p className="font-sans text-sm text-charcoal/80">{mission.title}</p>
                <span className="shrink-0 font-sans text-xs text-gold">+{mission.points}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Link
        href="/lounge"
        className="mt-10 inline-block font-sans text-[0.65rem] uppercase tracking-[0.25em] text-taupe hover:text-charcoal"
      >
        ← Back to Lounge
      </Link>
    </div>
  );
}
