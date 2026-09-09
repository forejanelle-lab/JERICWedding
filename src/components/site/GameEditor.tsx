"use client";

import { useState } from "react";
import { HIDEABLE_PAGES } from "@/lib/hub/content";
import { useHub } from "@/lib/hub/store";
import { readFileAsDataUrl } from "@/lib/hub/utils";
import type { PhotoQuestion, PredictionQuestion, QuizQuestion } from "@/lib/hub/types";

function uid() {
  return `q-${Math.random().toString(36).slice(2, 8)}`;
}

export function GameEditor({
  kind,
}: {
  kind: "know-us" | "trivia" | "photos" | "predictions";
}) {
  const { state, setGameQuestions, setPhotoQuestions, setPredictionQuestions } = useHub();

  if (kind === "photos") {
    return <PhotoEditor questions={state.photoQuestions} onChange={setPhotoQuestions} />;
  }
  if (kind === "predictions") {
    return <PredictionEditor questions={state.predictionQuestions} onChange={setPredictionQuestions} />;
  }
  const questions = state.gameQuestions[kind] ?? [];
  return (
    <QuizEditor
      questions={questions}
      onChange={(next) => setGameQuestions(kind, next)}
    />
  );
}

function TagPills({ selected, onToggle }: { selected: number; onToggle: (index: number) => void }) {
  return (
    <p className="font-sans text-[0.58rem] uppercase tracking-[0.14em] text-taupe">
      Correct: option {selected + 1}
      <button type="button" className="ml-2 text-olive" onClick={() => onToggle(selected)}>
        change
      </button>
    </p>
  );
}

function QuizEditor({
  questions,
  onChange,
}: {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}) {
  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <article key={question.id} className="soft-card space-y-3 p-4">
          <label className="block">
            <span className="label-caps">Question {index + 1}</span>
            <input
              className="input-line"
              value={question.question}
              onChange={(event) =>
                onChange(questions.map((item) => (item.id === question.id ? { ...item, question: event.target.value } : item)))
              }
            />
          </label>
          {question.options.map((option, optionIndex) => (
            <label key={optionIndex} className="flex items-center gap-2">
              <input
                type="radio"
                name={`${question.id}-correct`}
                checked={question.correctIndex === optionIndex}
                onChange={() =>
                  onChange(questions.map((item) => (item.id === question.id ? { ...item, correctIndex: optionIndex } : item)))
                }
              />
              <input
                className="input-line flex-1"
                value={option}
                onChange={(event) =>
                  onChange(
                    questions.map((item) =>
                      item.id === question.id
                        ? {
                            ...item,
                            options: item.options.map((choice, i) => (i === optionIndex ? event.target.value : choice)),
                          }
                        : item,
                    ),
                  )
                }
              />
            </label>
          ))}
          <TagPills
            selected={question.correctIndex}
            onToggle={(next) =>
              onChange(questions.map((item) => (item.id === question.id ? { ...item, correctIndex: (next + 1) % item.options.length } : item)))
            }
          />
          <label className="block">
            <span className="label-caps">Answer note</span>
            <input
              className="input-line"
              value={question.explanation}
              onChange={(event) =>
                onChange(questions.map((item) => (item.id === question.id ? { ...item, explanation: event.target.value } : item)))
              }
            />
          </label>
          <button
            type="button"
            className="btn-secondary !px-3 !py-2"
            onClick={() => onChange(questions.filter((item) => item.id !== question.id))}
          >
            Delete question
          </button>
        </article>
      ))}
      <button
        type="button"
        className="btn-secondary"
        onClick={() =>
          onChange([
            ...questions,
            { id: uid(), question: "New question", options: ["A", "B", "C", "D"], correctIndex: 0, explanation: "" },
          ])
        }
      >
        Add question
      </button>
    </div>
  );
}

function PhotoEditor({
  questions,
  onChange,
}: {
  questions: PhotoQuestion[];
  onChange: (questions: PhotoQuestion[]) => void;
}) {
  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <article key={question.id} className="soft-card space-y-3 p-4">
          <label className="block">
            <span className="label-caps">Prompt {index + 1}</span>
            <input
              className="input-line"
              value={question.prompt}
              onChange={(event) =>
                onChange(questions.map((item) => (item.id === question.id ? { ...item, prompt: event.target.value } : item)))
              }
            />
          </label>
          <div>
            <span className="label-caps">Photo</span>
            <div className="mt-2 overflow-hidden rounded-2xl border border-taupe/15 bg-cream">
              {question.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={question.image} alt="" className="aspect-[4/5] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center font-sans text-sm text-taupe">
                  No photo yet
                </div>
              )}
            </div>
            <label className="btn-secondary mt-3 inline-flex cursor-pointer !px-4 !py-2">
              {question.image ? "Replace photo" : "Upload photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const image = await readFileAsDataUrl(file);
                  onChange(questions.map((item) => (item.id === question.id ? { ...item, image } : item)));
                  event.target.value = "";
                }}
              />
            </label>
          </div>
          {question.options.map((option, optionIndex) => (
            <label key={optionIndex} className="flex items-center gap-2">
              <input
                type="radio"
                name={`${question.id}-correct`}
                checked={question.correctIndex === optionIndex}
                onChange={() =>
                  onChange(questions.map((item) => (item.id === question.id ? { ...item, correctIndex: optionIndex } : item)))
                }
              />
              <input
                className="input-line flex-1"
                value={option}
                onChange={(event) =>
                  onChange(
                    questions.map((item) =>
                      item.id === question.id
                        ? {
                            ...item,
                            options: item.options.map((choice, i) => (i === optionIndex ? event.target.value : choice)),
                          }
                        : item,
                    ),
                  )
                }
              />
            </label>
          ))}
          <label className="block">
            <span className="label-caps">Answer note</span>
            <input
              className="input-line"
              value={question.explanation}
              onChange={(event) =>
                onChange(questions.map((item) => (item.id === question.id ? { ...item, explanation: event.target.value } : item)))
              }
            />
          </label>
          <button
            type="button"
            className="btn-secondary !px-3 !py-2"
            onClick={() => onChange(questions.filter((item) => item.id !== question.id))}
          >
            Delete question
          </button>
        </article>
      ))}
      <button
        type="button"
        className="btn-secondary"
        onClick={() =>
          onChange([
            ...questions,
            {
              id: uid(),
              image: "",
              prompt: "New photo prompt",
              options: ["A", "B", "C", "D"],
              correctIndex: 0,
              explanation: "",
            },
          ])
        }
      >
        Add question
      </button>
    </div>
  );
}

function PredictionEditor({
  questions,
  onChange,
}: {
  questions: PredictionQuestion[];
  onChange: (questions: PredictionQuestion[]) => void;
}) {
  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <article key={question.id} className="soft-card space-y-3 p-4">
          <label className="block">
            <span className="label-caps">Question {index + 1}</span>
            <input
              className="input-line"
              value={question.question}
              onChange={(event) =>
                onChange(questions.map((item) => (item.id === question.id ? { ...item, question: event.target.value } : item)))
              }
            />
          </label>
          {question.options.map((option, optionIndex) => (
            <input
              key={optionIndex}
              className="input-line"
              value={option}
              onChange={(event) =>
                onChange(
                  questions.map((item) =>
                    item.id === question.id
                      ? {
                          ...item,
                          options: item.options.map((choice, i) => (i === optionIndex ? event.target.value : choice)),
                        }
                      : item,
                  ),
                )
              }
            />
          ))}
          <button
            type="button"
            className="btn-secondary !px-3 !py-2"
            onClick={() => onChange(questions.filter((item) => item.id !== question.id))}
          >
            Delete question
          </button>
        </article>
      ))}
      <button
        type="button"
        className="btn-secondary"
        onClick={() =>
          onChange([...questions, { id: uid(), question: "New prediction", options: ["A", "B", "C", "D"] }])
        }
      >
        Add question
      </button>
    </div>
  );
}

export function AccessTagEditor() {
  const { state, addAccessTag, updateAccessTag, removeAccessTag, togglePageHidden } = useHub();
  const tags = state.accessTags;
  const [newLabel, setNewLabel] = useState("");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-serif text-2xl uppercase">Hidden pages</h2>
        <p className="mt-2 font-sans text-sm text-charcoal/70">
          Hide a page from every guest for now. You can still open it. Unhide whenever it&apos;s ready.
        </p>
        <div className="mt-4 space-y-2">
          {HIDEABLE_PAGES.map((page) => {
            const hidden = (state.hiddenPages ?? []).includes(page.href);
            return (
              <div key={page.href} className="soft-card flex items-center justify-between gap-3 px-4 py-3">
                <p className="font-sans text-sm">
                  {page.label}
                  {hidden ? <span className="ml-2 text-taupe">Hidden</span> : null}
                </p>
                <button
                  type="button"
                  className="btn-secondary !px-3 !py-2"
                  onClick={() => togglePageHidden(page.href)}
                >
                  {hidden ? "Unhide" : "Hide"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl uppercase">Tag options</h2>
        <p className="mt-2 font-sans text-sm text-charcoal/70">
          These tags are assigned on the guest list. Rename them, add new ones, or remove ones you don&apos;t need.
        </p>
        <div className="mt-4 space-y-3">
          {tags.map((tag) => (
            <div key={tag.id} className="flex flex-wrap items-center gap-2">
              <input
                className="input-line min-w-[12rem] flex-1"
                value={tag.label}
                onChange={(event) => updateAccessTag(tag.id, event.target.value)}
              />
              <button
                type="button"
                className="font-sans text-[0.55rem] uppercase tracking-[0.14em] text-taupe"
                onClick={() => removeAccessTag(tag.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <form
          className="mt-4 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            addAccessTag(newLabel);
            setNewLabel("");
          }}
        >
          <input
            className="input-line min-w-[12rem] flex-1"
            value={newLabel}
            onChange={(event) => setNewLabel(event.target.value)}
            placeholder="Rehearsal dinner, family brunch…"
          />
          <button type="submit" className="btn-secondary !px-4 !py-2">
            Add tag
          </button>
        </form>
      </section>
    </div>
  );
}
