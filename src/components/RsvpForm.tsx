"use client";

import { useState, type FormEvent } from "react";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function RsvpForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  const inputClasses =
    "w-full border-0 border-b border-taupe/30 bg-transparent px-0 py-3 font-sans text-base text-charcoal placeholder:text-taupe/50 focus:border-charcoal focus:outline-none focus:ring-0 transition-colors";

  const labelClasses =
    "font-sans text-[0.6rem] uppercase tracking-[0.25em] text-taupe";

  return (
    <section id="rsvp" className="bg-cream px-6 py-24 md:px-10 md:py-32 lg:px-16">
      <div className="mx-auto max-w-xl">
        <FadeIn>
          <SectionHeading label="Will You Join Us?" />
        </FadeIn>

        {submitted ? (
          <FadeIn delay={100}>
            <div className="mt-16 border border-taupe/20 px-8 py-12 text-center">
              <p className="font-serif text-2xl font-light tracking-[0.08em] text-charcoal uppercase">
                Grazie
              </p>
              <p className="mt-4 font-sans text-base text-charcoal/70">
                Your response has been received. We cannot wait to celebrate with you
                in Italy.
              </p>
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={100}>
            <form onSubmit={handleSubmit} className="mt-16 space-y-8">
              <div>
                <label htmlFor="name" className={labelClasses}>
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className={inputClasses}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className={labelClasses}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={inputClasses}
                  placeholder="your@email.com"
                />
              </div>

              <fieldset>
                <legend className={labelClasses}>Attending?</legend>
                <div className="mt-4 flex gap-8">
                  {(["yes", "no"] as const).map((value) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-center gap-3 font-sans text-sm uppercase tracking-[0.15em] text-charcoal"
                    >
                      <input
                        type="radio"
                        name="attending"
                        value={value}
                        required
                        className="h-4 w-4 border-taupe/40 text-charcoal focus:ring-charcoal"
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor="guests" className={labelClasses}>
                  Number of Guests
                </label>
                <select id="guests" name="guests" className={inputClasses}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </div>

              <div>
                <label htmlFor="meal" className={labelClasses}>
                  Meal Preference
                </label>
                <select id="meal" name="meal" className={inputClasses}>
                  <option value="fish">Fish</option>
                  <option value="meat">Meat</option>
                  <option value="vegetarian">Vegetarian</option>
                </select>
              </div>

              <div>
                <label htmlFor="dietary" className={labelClasses}>
                  Dietary Restrictions
                </label>
                <input
                  id="dietary"
                  name="dietary"
                  type="text"
                  className={inputClasses}
                  placeholder="Any allergies or restrictions"
                />
              </div>

              <div>
                <label htmlFor="song" className={labelClasses}>
                  Song Request
                </label>
                <input
                  id="song"
                  name="song"
                  type="text"
                  className={inputClasses}
                  placeholder="A song you'd love to hear"
                />
              </div>

              <div>
                <label htmlFor="message" className={labelClasses}>
                  Message to the Couple
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className={`${inputClasses} resize-none`}
                  placeholder="Share your well wishes"
                />
              </div>

              <button
                type="submit"
                className="w-full border border-charcoal bg-charcoal px-8 py-4 font-sans text-[0.65rem] uppercase tracking-[0.3em] text-ivory transition-colors duration-300 hover:bg-transparent hover:text-charcoal"
              >
                RSVP
              </button>
            </form>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
