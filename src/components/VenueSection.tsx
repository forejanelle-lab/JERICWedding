import Image from "next/image";
import { WEDDING } from "@/lib/constants";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function VenueSection() {
  return (
    <section id="venue" className="relative bg-charcoal">
      <div className="relative aspect-[4/5] w-full md:aspect-[16/9]">
        <Image
          src="/images/venue-estate.jpg"
          alt={`${WEDDING.venue} — Italian countryside estate`}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-charcoal/30" />
      </div>

      <div className="relative -mt-24 bg-ivory px-6 pb-24 pt-16 md:-mt-32 md:px-10 md:pb-32 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <SectionHeading
              label={WEDDING.venue}
              script="Our Italian home for the weekend"
            />
          </FadeIn>

          <FadeIn delay={150}>
            <p className="mx-auto mt-10 max-w-2xl text-center font-sans text-base leading-relaxed text-charcoal/70 md:text-lg">
              Nestled in the rolling hills of Campania, {WEDDING.venue} is a
              historic countryside estate where ancient stone walls meet manicured
              gardens and centuries-old olive trees. With sweeping views of the
              surrounding landscape, terraced courtyards, and interiors that honor
              Italian craftsmanship, it is the setting we dreamed of for our
              celebration — intimate, elevated, and unmistakably Italian.
            </p>
          </FadeIn>

          <FadeIn delay={250}>
            <div className="mt-12 flex justify-center">
              <a
                href="https://www.casaledeimascioni.it"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-4 border border-charcoal/20 px-8 py-4 font-sans text-[0.65rem] uppercase tracking-[0.3em] text-charcoal transition-all duration-300 hover:border-charcoal hover:bg-charcoal hover:text-ivory"
              >
                Explore the Venue
                <span className="block h-px w-6 bg-current transition-all duration-300 group-hover:w-10" />
              </a>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
