"use client";

import { useActionState } from "react";
import { createBoardReply } from "@/lib/portal/actions";

const inputClasses =
  "mt-2 w-full border-0 border-b border-taupe/30 bg-transparent px-0 py-3 font-sans text-base text-charcoal placeholder:text-taupe/50 focus:border-charcoal focus:outline-none";

const labelClasses =
  "font-sans text-[0.6rem] uppercase tracking-[0.25em] text-taupe";

export function ReplyForm({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string }, formData: FormData) => {
      const result = await createBoardReply(formData);
      if (result && "error" in result && result.error) {
        return { error: result.error };
      }
      return {};
    },
    {},
  );

  return (
    <form action={formAction} className="border border-taupe/20 bg-ivory p-6">
      <input type="hidden" name="post_id" value={postId} />

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

      <div className="mt-6">
        <label htmlFor="body" className={labelClasses}>
          Add a Reply
        </label>
        <textarea
          id="body"
          name="body"
          rows={4}
          required
          className={`${inputClasses} resize-none`}
          placeholder="Write your reply..."
        />
      </div>

      {state.error && (
        <p className="mt-2 font-sans text-sm text-red-700/80" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 border border-charcoal bg-charcoal px-6 py-3 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-ivory transition-colors hover:bg-transparent hover:text-charcoal disabled:opacity-60"
      >
        {pending ? "Sending..." : "Reply"}
      </button>
    </form>
  );
}
