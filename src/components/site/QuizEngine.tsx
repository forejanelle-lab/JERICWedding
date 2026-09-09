"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/hub/types";
import { EditText } from "@/components/site/EditText";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function QuizEngine({
  title,
  eyebrow,
  intro,
  questions,
  pointsPerCorrect,
  alreadyPlayed,
  onFinish,
  editId,
}: {
  title: string;
  eyebrow: string;
  intro: string;
  questions: QuizQuestion[];
  pointsPerCorrect: number;
  alreadyPlayed?: boolean;
  onFinish: (score: number, points: number) => void;
  editId?: string;
}) {
  const { t, has } = useI18n();
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const question = questions[index];

  function choose(option: number) {
    if (revealed || !question) return;
    setSelected(option);
    setRevealed(true);
    if (option === question.correctIndex) setScore((value) => value + 1);
  }

  function next() {
    if (index >= questions.length - 1) {
      setPhase("done");
      onFinish(score, score * pointsPerCorrect);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setRevealed(false);
  }

  if (phase === "intro") {
    return (
      <div className="soft-card mx-auto max-w-2xl p-5 md:p-12">
        {editId ? (
          <EditText id={`${editId}.eyebrow`} as="p" className="label-caps text-olive">
            {eyebrow}
          </EditText>
        ) : (
          <p className="label-caps text-olive">{eyebrow}</p>
        )}
        {editId ? (
          <EditText id={`${editId}.title`} as="h1" className="mt-3 font-serif text-3xl font-light tracking-[0.08em] text-charcoal uppercase md:text-4xl">
            {title}
          </EditText>
        ) : (
          <h1 className="mt-3 font-serif text-3xl font-light tracking-[0.08em] text-charcoal uppercase md:text-4xl">
            {title}
          </h1>
        )}
        {editId ? (
          <EditText id={`${editId}.intro`} as="p" multiline className="mt-4 font-sans text-base leading-relaxed text-charcoal/70">
            {intro}
          </EditText>
        ) : (
          <p className="mt-4 font-sans text-base leading-relaxed text-charcoal/70">{intro}</p>
        )}
        {alreadyPlayed ? (
          <p className="mt-4 font-sans text-sm text-olive">{t("quiz.alreadyPlayed")}</p>
        ) : null}
        <button type="button" className="btn-primary mt-8" onClick={() => setPhase("play")}>
          {t("quiz.start")}
        </button>
      </div>
    );
  }

  if (phase === "done" || !question) {
    return (
      <div className="soft-card mx-auto max-w-2xl p-5 text-center md:p-12">
        <p className="label-caps">{t("quiz.yourScore")}</p>
        <p className="mt-4 font-serif text-6xl font-light text-charcoal">{score}/{questions.length}</p>
        <p className="mt-4 font-sans text-charcoal/70">
          {alreadyPlayed ? t("quiz.practice") : t("quiz.points", { n: score * pointsPerCorrect })}
        </p>
      </div>
    );
  }

  return (
    <div className="soft-card mx-auto max-w-2xl p-5 md:p-12">
      <p className="label-caps">
        {t("quiz.of", { n: index + 1, total: questions.length })}
      </p>
      <h2 className="mt-4 font-serif text-2xl font-light text-charcoal md:text-3xl">
        {editId ? (
          <EditText id={`${editId}.q.${question.id}`} as="span">
            {question.question}
          </EditText>
        ) : (
          question.question
        )}
      </h2>
      <div className="mt-8 space-y-3">
        {question.options.map((option, optionIndex) => {
          const optKey = editId ? `${editId}.q.${question.id}.opt.${optionIndex}` : "";
          const isCorrect = optionIndex === question.correctIndex;
          const isPick = optionIndex === selected;
          let classes = "w-full min-h-12 rounded-2xl border border-taupe/20 px-4 py-3.5 text-left font-sans text-base leading-snug transition-colors md:px-5 md:py-4 md:text-sm";
          if (revealed && isCorrect) classes += " border-olive bg-sage/15 text-forest";
          else if (revealed && isPick) classes += " border-taupe/40 bg-beige/40 text-charcoal/60";
          else classes += " hover:border-charcoal/30";
          return (
            <button key={option} type="button" className={classes} onClick={() => choose(optionIndex)}>
              {optKey && has(optKey) ? t(optKey) : option}
            </button>
          );
        })}
      </div>
      {revealed ? (
        <div className="mt-6">
          <p className="font-sans text-sm leading-relaxed text-charcoal/70">
            {editId && has(`${editId}.q.${question.id}.exp`) ? t(`${editId}.q.${question.id}.exp`) : question.explanation}
          </p>
          <button type="button" className="btn-primary mt-6" onClick={next}>
            {index >= questions.length - 1 ? t("quiz.seeScore") : t("quiz.next")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
