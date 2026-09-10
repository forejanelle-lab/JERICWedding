"use client";

import Link from "next/link";
import { GameEditor } from "@/components/site/GameEditor";
import { QuizEngine } from "@/components/site/QuizEngine";
import { canEditWebsite } from "@/lib/hub/access";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function KnowUsPage() {
  const { addScore, state } = useHub();
  const { t } = useI18n();
  const questions = state.gameQuestions["know-us"] ?? [];
  return (
    <main className="px-4 pt-[calc(4.75rem+env(safe-area-inset-top))] pb-8 md:px-5 md:py-28">
      {canEditWebsite(state) && state.siteEditing ? (
        <div className="mx-auto mb-10 max-w-2xl">
          <p className="label-caps text-olive">{t("quiz.editGame")}</p>
          <h1 className="mt-2 font-serif text-3xl uppercase">How well do you know us?</h1>
          <div className="mt-6">
            <GameEditor kind="know-us" />
          </div>
        </div>
      ) : (
        <QuizEngine
          title="How well do you know us?"
          eyebrow="Game 1"
          intro="Six questions. Be honest. Points land on the wedding leaderboard if you've joined the community."
          questions={questions}
          pointsPerCorrect={50}
          alreadyPlayed={state.completedGames.includes("know-us")}
          editId="play.know-us"
          onFinish={(_score, points) => addScore("know-us", points)}
        />
      )}
      <p className="mt-8 text-center">
        <Link href="/play" className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-taupe">
          {t("quiz.backToGames")}
        </Link>
      </p>
    </main>
  );
}
