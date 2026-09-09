"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  LEADERBOARD,
  WHO_KNOWS_US_QUESTIONS,
  type QuizQuestion,
} from "@/lib/lounge/constants";

type QuizPhase = "intro" | "question" | "results";

export function WhoKnowsUsQuiz({ guestName }: { guestName: string }) {
  const [phase, setPhase] = useState<QuizPhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const question: QuizQuestion | undefined = WHO_KNOWS_US_QUESTIONS[currentIndex];
  const total = WHO_KNOWS_US_QUESTIONS.length;

  const rank = useMemo(() => {
    const guestScore = score * 10;
    const position =
      LEADERBOARD.findIndex((entry) => guestScore >= entry.points) + 1;
    return position === 0 ? LEADERBOARD.length + 1 : position;
  }, [score]);

  function handleAnswer(optionIndex: number) {
    if (showExplanation || !question) return;
    setSelectedIndex(optionIndex);
    setShowExplanation(true);
    if (optionIndex === question.correctIndex) {
      setScore((prev) => prev + 1);
    }
  }

  function handleNext() {
    if (currentIndex >= total - 1) {
      setPhase("results");
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedIndex(null);
    setShowExplanation(false);
  }

  if (phase === "intro") {
    return (
      <div className="border border-taupe/20 bg-ivory p-8 md:p-12">
        <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-olive">
          Quiz · 5 Questions
        </p>
        <h2 className="mt-4 font-serif text-3xl font-light tracking-[0.08em] text-charcoal uppercase md:text-4xl">
          Who Knows Janelle & Eric Best?
        </h2>
        <p className="mt-4 max-w-xl font-sans text-base leading-relaxed text-charcoal/70">
          Think you know the couple? Answer five questions, see how you rank,
          and learn a few stories along the way.
        </p>
        <div className="mt-8 flex flex-wrap gap-6 font-sans text-sm text-taupe">
          <span>+50 points</span>
          <span>Highest score: 9/10</span>
          <span>{LEADERBOARD[0].name} is currently #1</span>
        </div>
        <button
          type="button"
          onClick={() => setPhase("question")}
          className="mt-10 border border-charcoal bg-charcoal px-8 py-4 font-sans text-[0.65rem] uppercase tracking-[0.3em] text-ivory transition-colors hover:bg-transparent hover:text-charcoal"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  if (phase === "results") {
    return (
      <div className="border border-taupe/20 bg-ivory p-8 md:p-12">
        <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-olive">
          Quiz Complete
        </p>
        <h2 className="mt-4 font-serif text-3xl font-light tracking-[0.08em] text-charcoal uppercase">
          Nice work, {guestName.split(" ")[0]}!
        </h2>
        <p className="mt-6 font-serif text-5xl font-light text-charcoal">
          {score}/{total}
        </p>
        <p className="mt-2 font-sans text-sm text-charcoal/65">
          You earned 50 points · Estimated rank #{rank}
        </p>

        <div className="mt-10 border border-taupe/15 p-6">
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-taupe">
            Leaderboard
          </p>
          <ol className="mt-4 space-y-3">
            {LEADERBOARD.slice(0, 3).map((entry) => (
              <li
                key={entry.rank}
                className="flex items-center justify-between font-sans text-sm text-charcoal/80"
              >
                <span>
                  {entry.rank}. {entry.name}
                </span>
                <span className="text-taupe">{entry.points} pts</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => {
              setPhase("intro");
              setCurrentIndex(0);
              setScore(0);
              setSelectedIndex(null);
              setShowExplanation(false);
            }}
            className="border border-charcoal px-6 py-3 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-charcoal"
          >
            Play Again
          </button>
          <Link
            href="/lounge/games"
            className="border border-taupe/25 px-6 py-3 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-taupe hover:border-charcoal hover:text-charcoal"
          >
            Back to Games
          </Link>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="border border-taupe/20 bg-ivory p-8 md:p-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-taupe">
          Question {currentIndex + 1} of {total}
        </p>
        <div className="h-px flex-1 bg-taupe/15">
          <div
            className="h-px bg-olive transition-all duration-500"
            style={{ width: `${((currentIndex + (showExplanation ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="font-serif text-2xl font-light leading-snug text-charcoal md:text-3xl">
        {question.question}
      </h2>

      <div className="mt-8 space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = index === question.correctIndex;
          let stateClasses =
            "border-taupe/20 hover:border-charcoal/30 hover:bg-cream";

          if (showExplanation) {
            if (isCorrect) stateClasses = "border-olive bg-olive/5";
            else if (isSelected) stateClasses = "border-red-300/50 bg-red-50/40";
            else stateClasses = "border-taupe/10 opacity-60";
          } else if (isSelected) {
            stateClasses = "border-charcoal bg-cream";
          }

          return (
            <button
              key={option}
              type="button"
              disabled={showExplanation}
              onClick={() => handleAnswer(index)}
              className={`w-full border px-5 py-4 text-left font-sans text-sm text-charcoal transition-all duration-300 disabled:cursor-default ${stateClasses}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className="mt-8 border border-gold/20 bg-gold/5 p-5">
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-gold">
            {selectedIndex === question.correctIndex ? "Correct" : "Not quite"}
          </p>
          <p className="mt-2 font-sans text-sm leading-relaxed text-charcoal/75">
            {question.explanation}
          </p>
          <button
            type="button"
            onClick={handleNext}
            className="mt-5 border border-charcoal bg-charcoal px-6 py-3 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-ivory"
          >
            {currentIndex >= total - 1 ? "See Results" : "Next Question"}
          </button>
        </div>
      )}
    </div>
  );
}
