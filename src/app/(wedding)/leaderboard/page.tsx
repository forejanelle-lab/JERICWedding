"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader, SectionWrap } from "@/components/site/PageHeader";
import { guestName, useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const CATS = [
  { id: "overall", label: "Overall" },
  { id: "know-us", label: "Trivia / Know us" },
  { id: "predictions", label: "Predictions" },
  { id: "photos", label: "Photo game" },
] as const;

export default function LeaderboardPage() {
  const { state } = useHub();
  const { t } = useI18n();
  const [cat, setCat] = useState<(typeof CATS)[number]["id"]>("overall");

  const rows = [...state.guests]
    .filter((guest) => guest.visibility.showOnLeaderboard)
    .map((guest) => {
      const extra = guest.id === state.identity?.guestId ? 0 : 0;
      const score =
        cat === "overall"
          ? guest.points
          : guest.id === state.identity?.guestId
            ? state.gameScores[cat] ?? 0
            : Math.round(guest.points / (cat === "predictions" ? 8 : 5));
      return { guest, score: score + extra };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  return (
    <main className="pt-24 md:pt-28">
      <SectionWrap className="bg-ivory">
        <PageHeader
          editId="leaderboard"
          eyebrow="Playful, not precious"
          title="Wedding Leaderboard"
          description="Winners revealed after the wedding. Hide your name anytime from My Weekend."
        />
        <div className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-2">
          {CATS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCat(item.id)}
              className={`rounded-full px-4 py-2 font-sans text-[0.6rem] uppercase tracking-[0.16em] ${
                cat === item.id ? "bg-forest text-ivory" : "bg-cream"
              }`}
            >
              {t(
                item.id === "overall"
                  ? "leaderboard.overall"
                  : item.id === "know-us"
                    ? "leaderboard.knowUs"
                    : item.id === "predictions"
                      ? "leaderboard.predictions"
                      : "leaderboard.photos",
              )}
            </button>
          ))}
        </div>
        <ol className="mx-auto mt-10 max-w-xl space-y-3">
          {rows.map((row, index) => (
            <li key={row.guest.id} className="soft-card flex items-center justify-between px-5 py-4">
              <span className="flex items-center gap-4">
                <span className="w-8 font-serif text-2xl text-olive">{index + 1}</span>
                <span className="font-sans text-charcoal">{guestName(row.guest)}</span>
              </span>
              <span className="font-serif text-xl tabular-nums">{row.score.toLocaleString()} pts</span>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-center">
          <Link href="/play" className="btn-secondary">
            {t("quiz.start")}
          </Link>
        </p>
      </SectionWrap>
    </main>
  );
}
