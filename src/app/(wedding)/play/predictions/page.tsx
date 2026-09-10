"use client";

import { useState } from "react";
import Link from "next/link";
import { GameEditor } from "@/components/site/GameEditor";
import { EditText } from "@/components/site/EditText";
import { canEditWebsite } from "@/lib/hub/access";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function PredictionsPage() {
  const { savePredictions, state } = useHub();
  const { t, has } = useI18n();
  const questions = state.predictionQuestions;
  const [answers, setAnswers] = useState<Record<string, string>>(state.predictions);
  const [saved, setSaved] = useState(state.completedGames.includes("predictions"));

  if (canEditWebsite(state) && state.siteEditing) {
    return (
      <main className="px-4 pt-[calc(4.75rem+env(safe-area-inset-top))] pb-8 md:px-5 md:py-28">
        <div className="mx-auto max-w-2xl">
          <p className="label-caps text-olive">{t("quiz.editGame")}</p>
          <h1 className="mt-2 font-serif text-3xl uppercase">Predictions</h1>
          <div className="mt-6">
            <GameEditor kind="predictions" />
          </div>
          <p className="mt-8">
            <Link href="/play" className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-taupe">
              {t("quiz.backToGames")}
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 pt-[calc(4.75rem+env(safe-area-inset-top))] pb-8 md:px-5 md:py-28">
      <div className="mx-auto max-w-2xl">
        <EditText id="play.predictions.kicker" as="p" className="label-caps text-olive">
          Game 3
        </EditText>
        <EditText id="play.predictions.title" as="h1" className="mt-3 font-serif text-4xl font-light tracking-[0.08em] uppercase">
          Predictions
        </EditText>
        <EditText id="play.predictions.intro" as="p" multiline className="mt-4 font-sans text-charcoal/70">
          Lock in your guesses before the wedding. We&apos;ll reveal who was right afterward — and toast the oracle.
        </EditText>
        <form
          className="mt-10 space-y-8"
          onSubmit={(event) => {
            event.preventDefault();
            savePredictions(answers);
            setSaved(true);
          }}
        >
          {questions.map((question) => (
            <fieldset key={question.id}>
              <legend className="font-serif text-xl">
                <EditText id={`play.predictions.${question.id}`} as="span">
                  {question.question}
                </EditText>
              </legend>
              <div className="mt-3 grid gap-2">
                {question.options.map((option, optionIndex) => {
                  const optKey = `play.predictions.${question.id}.opt.${optionIndex}`;
                  return (
                  <label key={option} className="flex items-center gap-3 rounded-2xl border border-taupe/15 px-4 py-3 font-sans text-sm">
                    <input
                      type="radio"
                      name={question.id}
                      checked={answers[question.id] === option}
                      onChange={() => setAnswers({ ...answers, [question.id]: option })}
                    />
                    {has(optKey) ? t(optKey) : option}
                  </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
          <button type="submit" className="btn-primary">
            {saved ? t("play.predictions.update") : t("play.predictions.save")}
          </button>
          {saved ? (
            <p className="font-sans text-sm text-olive">{t("play.predictions.saved")}</p>
          ) : null}
        </form>
        <p className="mt-8">
          <Link href="/play" className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-taupe">
            {t("quiz.backToGames")}
          </Link>
        </p>
      </div>
    </main>
  );
}
