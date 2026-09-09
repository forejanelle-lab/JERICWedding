"use client";

import { useActionState } from "react";
import { createRide } from "@/lib/portal/actions";
import {
  REGION_FILTER_OPTIONS,
  RIDE_TYPE_OPTIONS,
} from "@/lib/portal/constants";

const inputClasses =
  "mt-2 w-full border-0 border-b border-taupe/30 bg-transparent px-0 py-3 font-sans text-base text-charcoal placeholder:text-taupe/50 focus:border-charcoal focus:outline-none";

const labelClasses =
  "font-sans text-[0.6rem] uppercase tracking-[0.25em] text-taupe";

export function RideForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string }, formData: FormData) => {
      const result = await createRide(formData);
      if (result && "error" in result && result.error) {
        return { error: result.error };
      }
      return {};
    },
    {},
  );

  return (
    <form
      action={formAction}
      className="border border-taupe/20 bg-ivory p-8"
    >
      <h2 className="font-serif text-xl font-light tracking-[0.08em] text-charcoal uppercase">
        Post a Ride
      </h2>
      <p className="mt-2 font-sans text-sm text-charcoal/60">
        Share airport transfers, hotel runs, or rides to the venue.
      </p>

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
          <label htmlFor="type" className={labelClasses}>
            Type
          </label>
          <select id="type" name="type" required className={inputClasses}>
            {RIDE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="from_location" className={labelClasses}>
              From
            </label>
            <input
              id="from_location"
              name="from_location"
              type="text"
              required
              className={inputClasses}
              placeholder="NAP Airport"
            />
          </div>
          <div>
            <label htmlFor="to_location" className={labelClasses}>
              To
            </label>
            <input
              id="to_location"
              name="to_location"
              type="text"
              required
              className={inputClasses}
              placeholder="Casale dei Mascioni"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label htmlFor="ride_date" className={labelClasses}>
              Date
            </label>
            <input
              id="ride_date"
              name="ride_date"
              type="date"
              required
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="seats" className={labelClasses}>
              Seats
            </label>
            <input
              id="seats"
              name="seats"
              type="number"
              min={1}
              defaultValue={1}
              required
              className={inputClasses}
            />
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
        </div>

        <div>
          <label htmlFor="notes" className={labelClasses}>
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className={`${inputClasses} resize-none`}
            placeholder="Pickup time, cost sharing, contact preferences..."
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
        {pending ? "Posting..." : "Post Ride"}
      </button>
    </form>
  );
}
