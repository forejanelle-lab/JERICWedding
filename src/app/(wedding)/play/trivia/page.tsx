"use client";

import Link from "next/link";
import { GameEditor } from "@/components/site/GameEditor";
import { QuizEngine } from "@/components/site/QuizEngine";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function TriviaPage() {
  const { addScore, state } = useHub();
  const { t } = useI18n();
  const questions = state.gameQuestions.trivia ?? [];
  return (
    <main className="px-4 pt-[calc(4.75rem+env(safe-area-inset-top))] pb-8 md:px-5 md:py-28">
      {state.adminAuthed && state.siteEditing ? (
        <div className="mx-auto mb-10 max-w-2xl">
          <p className="label-caps text-olive">{t("quiz.editGame")}</p>
          <h1 className="mt-2 font-serif text-3xl uppercase">Wedding trivia</h1>
          <div className="mt-6">
            <GameEditor kind="trivia" />
          </div>
        </div>
      ) : (
        <QuizEngine
          title="Wedding trivia"
          eyebrow="Game 2"
          intro="Italy, family, first dances, hidden talents. Incorrect answers still get a story."
          questions={questions}
          pointsPerCorrect={40}
          alreadyPlayed={state.completedGames.includes("trivia")}
          editId="play.trivia"
          onFinish={(_score, points) => addScore("trivia", points)}
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
