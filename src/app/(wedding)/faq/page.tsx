"use client";

import { useState } from "react";
import { PageHeader, SectionWrap } from "@/components/site/PageHeader";
import { EditText } from "@/components/site/EditText";
import { FAQ_ITEMS } from "@/lib/hub/content";

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <main className="pt-24 md:pt-28">
      <SectionWrap className="bg-ivory">
        <PageHeader editId="faq" eyebrow="Practicalities" title="FAQ" />
        <div className="mx-auto mt-12 max-w-3xl divide-y divide-taupe/20">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = open === index;
            return (
              <div key={item.question} className="py-6">
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-6 text-left"
                  onClick={() => setOpen(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <EditText id={`faq.${index}.question`} as="span" className="font-sans text-[0.7rem] uppercase tracking-[0.2em] text-charcoal">
                    {item.question}
                  </EditText>
                  <span className={`text-taupe ${isOpen ? "rotate-45" : ""}`}>+</span>
                </button>
                {isOpen ? (
                  <EditText id={`faq.${index}.answer`} as="p" multiline className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-charcoal/70">
                    {item.answer}
                  </EditText>
                ) : null}
              </div>
            );
          })}
        </div>
      </SectionWrap>
    </main>
  );
}
