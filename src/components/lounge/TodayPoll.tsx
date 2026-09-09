"use client";

import { useState } from "react";
import { TODAY_POLL } from "@/lib/lounge/constants";

export function TodayPoll() {
  const [voted, setVoted] = useState<string | null>(null);
  const total = TODAY_POLL.totalVotes + (voted ? 1 : 0);

  return (
    <section className="border border-taupe/20 bg-ivory p-6">
      <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-olive">
        Today&apos;s Poll
      </p>
      <h3 className="mt-3 font-serif text-xl font-light text-charcoal">
        {TODAY_POLL.question}
      </h3>

      <div className="mt-6 space-y-3">
        {TODAY_POLL.options.map((option) => {
          const votes = option.votes + (voted === option.id ? 1 : 0);
          const percent = Math.round((votes / total) * 100);
          const isSelected = voted === option.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={Boolean(voted)}
              onClick={() => setVoted(option.id)}
              className={`relative w-full overflow-hidden border px-4 py-3 text-left transition-colors ${
                isSelected
                  ? "border-charcoal"
                  : "border-taupe/15 hover:border-charcoal/25 disabled:hover:border-taupe/15"
              }`}
            >
              <div
                className="absolute inset-y-0 left-0 bg-olive/10 transition-all duration-700"
                style={{ width: voted ? `${percent}%` : "0%" }}
              />
              <div className="relative flex items-center justify-between gap-4">
                <span className="font-sans text-sm text-charcoal">{option.label}</span>
                {voted && (
                  <span className="font-sans text-xs text-taupe">{percent}%</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-4 font-sans text-xs text-taupe">
        {total} votes · {TODAY_POLL.comments} comments
        {voted && " · +10 points"}
      </p>
    </section>
  );
}
