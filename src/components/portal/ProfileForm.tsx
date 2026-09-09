"use client";

import { useActionState } from "react";
import { createProfile } from "@/lib/portal/actions";

const inputClasses =
  "mt-2 w-full border-0 border-b border-taupe/30 bg-transparent px-0 py-3 font-sans text-base text-charcoal placeholder:text-taupe/50 focus:border-charcoal focus:outline-none";

const labelClasses =
  "font-sans text-[0.6rem] uppercase tracking-[0.25em] text-taupe";

export function ProfileForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string }, formData: FormData) => {
      const result = await createProfile(formData);
      if (result && "error" in result && result.error) {
        return { error: result.error };
      }
      return {};
    },
    {},
  );

  return (
    <form action={formAction} className="space-y-8 border border-taupe/20 p-8">
      <div>
        <h2 className="font-serif text-xl font-light tracking-[0.08em] text-charcoal uppercase">
          Add Your Profile
        </h2>
        <p className="mt-2 font-sans text-sm text-charcoal/60">
          Tell fellow guests a little about yourself so you can connect before
          the wedding.
        </p>
      </div>

      <div>
        <label htmlFor="display_name" className={labelClasses}>
          Display Name
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          required
          className={inputClasses}
          placeholder="How you'd like to be known"
        />
      </div>

      <div>
        <label htmlFor="region" className={labelClasses}>
          Home Region
        </label>
        <select
          id="region"
          name="region"
          required
          defaultValue=""
          className={inputClasses}
        >
          <option value="" disabled>
            Select region
          </option>
          <option value="us">United States</option>
          <option value="europe">Europe</option>
        </select>
      </div>

      <div>
        <label htmlFor="home_city" className={labelClasses}>
          Home City
        </label>
        <input
          id="home_city"
          name="home_city"
          type="text"
          className={inputClasses}
          placeholder="e.g. New York or Milan"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <label htmlFor="arrival_date" className={labelClasses}>
            Arrival in Italy
          </label>
          <input
            id="arrival_date"
            name="arrival_date"
            type="date"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="departure_date" className={labelClasses}>
            Departure from Italy
          </label>
          <input
            id="departure_date"
            name="departure_date"
            type="date"
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label htmlFor="bio" className={labelClasses}>
          About You
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          className={`${inputClasses} resize-none`}
          placeholder="Share a little about yourself — how you know the couple, travel plans, interests..."
        />
      </div>

      {state.error && (
        <p className="font-sans text-sm text-red-700/80" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="border border-charcoal bg-charcoal px-8 py-4 font-sans text-[0.65rem] uppercase tracking-[0.3em] text-ivory transition-colors hover:bg-transparent hover:text-charcoal disabled:opacity-60"
      >
        {pending ? "Saving..." : "Add Profile"}
      </button>
    </form>
  );
}
