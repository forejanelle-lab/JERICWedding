import { WEDDING_DAY_TIMELINE } from "@/lib/constants";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function WeddingDayTimeline() {
  return (
    <section className="bg-charcoal px-6 py-24 text-ivory md:px-10 md:py-32 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <SectionHeading
            label="The Wedding Day"
            script="Sunday, September 5"
            className="[&_h2]:text-ivory [&_p]:text-ivory/50"
          />
        </FadeIn>

        <div className="relative mt-16 md:mt-20">
          <div
            className="absolute bottom-0 left-4 top-0 w-px bg-ivory/15 md:left-8"
            aria-hidden="true"
          />

          {WEDDING_DAY_TIMELINE.map((item, index) => (
            <FadeIn key={item.title} delay={index * 80}>
              <article className="relative pb-12 pl-12 md:pb-16 md:pl-20">
                <div
                  className="absolute left-[13px] top-2 h-2 w-2 rounded-full bg-gold/60 md:left-[29px]"
                  aria-hidden="true"
                />

                <p className="font-sans text-[0.65rem] uppercase tracking-[0.3em] text-gold/80">
                  {item.time}
                </p>
                <h3 className="mt-2 font-serif text-2xl font-light tracking-[0.1em] uppercase md:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-lg font-sans text-sm leading-relaxed text-ivory/60 md:text-base">
                  {item.description}
                </p>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
