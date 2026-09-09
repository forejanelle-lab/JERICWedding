"use client";

import { useActionState } from "react";
import { createBoardPost } from "@/lib/portal/actions";
import {
  BOARD_CATEGORIES,
  REGION_FILTER_OPTIONS,
} from "@/lib/portal/constants";

const inputClasses =
  "mt-2 w-full border-0 border-b border-taupe/30 bg-transparent px-0 py-3 font-sans text-base text-charcoal placeholder:text-taupe/50 focus:border-charcoal focus:outline-none";

const labelClasses =
  "font-sans text-[0.6rem] uppercase tracking-[0.25em] text-taupe";

export function BoardPostForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string }, formData: FormData) => {
      const result = await createBoardPost(formData);
      if (result && "error" in result && result.error) {
        return { error: result.error };
      }
      return {};
    },
    {},
  );

  return (
    <form action={formAction} className="border border-taupe/20 bg-ivory p-8">
      <h2 className="font-serif text-xl font-light tracking-[0.08em] text-charcoal uppercase">
        Start a Thread
      </h2>

      <div className="mt-8 space-y-6">
        <div>
          <label htmlFor="author_name" className={labelClasses}>
            Your Name
          </label>
          <input
            id="author_name"
            name="author_name"
            type="text"
            required
            className={inputClasses}
            placeholder="How you'd like to be known"
          />
        </div>

        <div>
          <label htmlFor="category" className={labelClasses}>
            Category
          </label>
          <select id="category" name="category" required className={inputClasses}>
            {BOARD_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="region_tag" className={labelClasses}>
            Region Tag
          </label>
          <select id="region_tag" name="region_tag" className={inputClasses}>
            <option value="">Any</option>
            {REGION_FILTER_OPTIONS.filter((o) => o.value !== "all").map(
              (option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ),
            )}
          </select>
        </div>

        <div>
          <label htmlFor="title" className={labelClasses}>
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className={inputClasses}
            placeholder="What's on your mind?"
          />
        </div>

        <div>
          <label htmlFor="body" className={labelClasses}>
            Message
          </label>
          <textarea
            id="body"
            name="body"
            rows={5}
            required
            className={`${inputClasses} resize-none`}
            placeholder="Share travel tips, suggest a meetup, or introduce yourself..."
          />
        </div>
      </div>

      {state.error && (
        <p className="mt-4 font-sans text-sm text-red-700/80" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-8 border border-charcoal bg-charcoal px-8 py-4 font-sans text-[0.65rem] uppercase tracking-[0.3em] text-ivory transition-colors hover:bg-transparent hover:text-charcoal disabled:opacity-60"
      >
        {pending ? "Posting..." : "Post Thread"}
      </button>
    </form>
  );
}
