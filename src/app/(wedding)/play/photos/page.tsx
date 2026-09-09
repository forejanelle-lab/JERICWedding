"use client";

import { useState } from "react";
import Link from "next/link";
import { GameEditor } from "@/components/site/GameEditor";
import { EditImage } from "@/components/site/EditImage";
import { EditText } from "@/components/site/EditText";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function PhotoGamePage() {
  const { addScore, state } = useHub();
  const { t, has } = useI18n();
  const questions = state.photoQuestions;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const question = questions[index];
  const played = state.completedGames.includes("photos");

  if (state.adminAuthed && state.siteEditing) {
    return (
      <main className="px-4 pt-[calc(4.75rem+env(safe-area-inset-top))] pb-8 md:px-5 md:py-28">
        <div className="mx-auto max-w-2xl">
          <p className="label-caps text-olive">{t("quiz.editGame")}</p>
          <h1 className="mt-2 font-serif text-3xl uppercase">Guess the photo</h1>
          <div className="mt-6">
            <GameEditor kind="photos" />
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

  if (done || !question) {
    return (
      <main className="px-4 pt-[calc(4.75rem+env(safe-area-inset-top))] pb-8 md:px-5 md:py-28">
        <div className="soft-card mx-auto max-w-xl p-10 text-center">
          <p className="label-caps">{t("play.photos.title")}</p>
          <p className="mt-4 font-serif text-6xl">{score}/{questions.length}</p>
          <p className="mt-3 font-sans text-charcoal/70">
            {played ? t("quiz.practiceShort") : t("quiz.points", { n: score * 40 })}
          </p>
          <Link href="/play" className="btn-secondary mt-8">
            {t("quiz.backToGames")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 pt-[calc(4.75rem+env(safe-area-inset-top))] pb-8 md:px-5 md:py-28">
      <div className="mx-auto max-w-xl">
        <p className="label-caps text-olive">
          {t("play.photos.kicker", { n: index + 1, total: questions.length })}
        </p>
        <EditText id="play.photos.title" as="h1" className="mt-3 font-serif text-3xl font-light uppercase">
          Guess the photo
        </EditText>
        <div className="relative mt-8 aspect-[4/5] overflow-hidden rounded-2xl bg-cream">
          {question.image ? (
            <EditImage id={`play.photos.${question.id}.image`} src={question.image} alt="" fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center font-sans text-sm text-taupe">{t("quiz.photoSoon")}</div>
          )}
        </div>
        <EditText id={`play.photos.${question.id}.prompt`} as="p" className="mt-6 font-serif text-2xl">
          {question.prompt}
        </EditText>
        <div className="mt-6 space-y-3">
          {question.options.map((option, optionIndex) => {
            const revealed = selected !== null;
            const correct = optionIndex === question.correctIndex;
            const optKey = `play.photos.${question.id}.opt.${optionIndex}`;
            return (
              <button
                key={option}
                type="button"
                disabled={revealed}
                onClick={() => {
                  setSelected(optionIndex);
                  if (optionIndex === question.correctIndex) setScore((value) => value + 1);
                }}
                className={`w-full rounded-2xl border px-4 py-3 text-left font-sans text-sm ${
                  revealed && correct
                    ? "border-olive bg-sage/15"
                    : revealed && optionIndex === selected
                      ? "border-taupe/40 bg-beige/40"
                      : "border-taupe/20"
                }`}
              >
                {has(optKey) ? t(optKey) : option}
              </button>
            );
          })}
        </div>
        {selected !== null ? (
          <div className="mt-6">
            <p className="font-sans text-sm text-charcoal/70">
              {has(`play.photos.${question.id}.exp`) ? t(`play.photos.${question.id}.exp`) : question.explanation}
            </p>
            <button
              type="button"
              className="btn-primary mt-5"
              onClick={() => {
                if (index >= questions.length - 1) {
                  if (!played) addScore("photos", (score) * 40);
                  setDone(true);
                  return;
                }
                setIndex((value) => value + 1);
                setSelected(null);
              }}
            >
              {index >= questions.length - 1 ? t("quiz.seeScore") : t("quiz.next")}
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
