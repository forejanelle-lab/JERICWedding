"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/constants";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-ivory px-6 py-24 md:px-10 md:py-32 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <SectionHeading label="FAQ" script="Questions & answers" />
        </FadeIn>

        <div className="mt-16 divide-y divide-taupe/20">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <FadeIn key={item.question} delay={index * 50}>
                <div className="py-6 md:py-8">
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-6 text-left"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span className="font-sans text-[0.7rem] uppercase tracking-[0.2em] text-charcoal md:text-xs">
                      {item.question}
                    </span>
                    <span
                      className={`mt-1 shrink-0 font-sans text-lg text-taupe transition-transform duration-300 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pt-4 font-sans text-base leading-relaxed text-charcoal/70">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
