import { WEEKEND_EVENTS } from "@/lib/constants";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function WeekendSection() {
  return (
    <section id="weekend" className="bg-ivory px-6 py-24 md:px-10 md:py-32 lg:px-16">
      <div className="mx-auto max-w-4xl">
        <FadeIn>
          <SectionHeading label="The Weekend" script="Three days in Campania" />
        </FadeIn>

        <div className="mt-16 md:mt-20">
          {WEEKEND_EVENTS.map((event, index) => (
            <FadeIn key={event.day} delay={index * 100}>
              <article
                className={`grid gap-6 border-t border-taupe/20 py-10 md:grid-cols-[140px_1fr] md:gap-12 md:py-14 ${
                  index === WEEKEND_EVENTS.length - 1 ? "border-b border-taupe/20" : ""
                }`}
              >
                <div>
                  <p className="font-serif text-2xl font-light tracking-[0.08em] text-charcoal uppercase md:text-3xl">
                    {event.day}
                  </p>
                  <p className="mt-2 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-taupe">
                    {event.date}
                  </p>
                </div>

                <div>
                  <h3 className="font-serif text-xl font-light tracking-[0.06em] text-charcoal uppercase md:text-2xl">
                    {event.title}
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 font-sans text-sm text-charcoal/60">
                    <span className="uppercase tracking-[0.15em]">{event.time}</span>
                    <span>{event.location}</span>
                  </div>

                  <p className="mt-4 max-w-xl font-sans text-base leading-relaxed text-charcoal/70">
                    {event.description}
                  </p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
