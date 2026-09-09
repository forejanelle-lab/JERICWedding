"use client";

import { useActionState } from "react";
import { enterLounge } from "@/lib/lounge/actions";
import { DEMO_LOGIN } from "@/lib/lounge/session";

const inputClasses =
  "mt-2 w-full border-0 border-b border-taupe/30 bg-transparent px-0 py-3 font-sans text-base text-charcoal placeholder:text-taupe/50 focus:border-charcoal focus:outline-none";

const labelClasses =
  "font-sans text-[0.6rem] uppercase tracking-[0.25em] text-taupe";

export function LoungeLoginForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string }, formData: FormData) => {
      const result = await enterLounge(formData);
      if (result && "error" in result && result.error) {
        return { error: result.error };
      }
      return {};
    },
    {},
  );

  return (
    <form action={formAction} className="border border-taupe/20 bg-ivory p-8 md:p-10">
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-light tracking-[0.08em] text-charcoal uppercase">
          Enter with Invitation
        </h2>
        <p className="mt-3 font-sans text-sm leading-relaxed text-charcoal/65">
          One shared invitation code for all guests (not tied to your name yet).
          Enter the code and how you&apos;d like to appear in the lounge.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <label htmlFor="invitation_code" className={labelClasses}>
            Invitation Code
          </label>
          <input
            id="invitation_code"
            name="invitation_code"
            type="text"
            required
            autoComplete="off"
            defaultValue={DEMO_LOGIN.invitationCode}
            className={`${inputClasses} uppercase tracking-[0.2em]`}
            placeholder="From your invite"
          />
        </div>

        <div>
          <label htmlFor="guest_name" className={labelClasses}>
            Your Name
          </label>
          <input
            id="guest_name"
            name="guest_name"
            type="text"
            required
            defaultValue={DEMO_LOGIN.guestName}
            className={inputClasses}
            placeholder="How you'd like to be known"
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClasses}>
            Email <span className="normal-case tracking-normal text-taupe/70">(optional)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={inputClasses}
            placeholder="For magic link sign-in later"
          />
        </div>
      </div>

      {state.error && (
        <p className="mt-6 font-sans text-sm text-red-700/80" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-8 w-full border border-charcoal bg-charcoal px-8 py-4 font-sans text-[0.65rem] uppercase tracking-[0.3em] text-ivory transition-colors hover:bg-transparent hover:text-charcoal disabled:opacity-60"
      >
        {pending ? "Entering..." : "Enter the Guest Lounge"}
      </button>
    </form>
  );
}
