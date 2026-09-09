import { CAMPANIA_DESTINATIONS } from "@/lib/constants";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import Image from "next/image";

export function CampaniaGuide() {
  return (
    <section id="campania" className="bg-charcoal px-6 py-24 text-ivory md:px-10 md:py-32 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <SectionHeading
            label="Campania Guide"
            script="Explore the region"
            className="[&_h2]:text-ivory [&_p]:text-ivory/50"
          />
        </FadeIn>

        <div className="mt-16 space-y-24 md:mt-20 md:space-y-32">
          {CAMPANIA_DESTINATIONS.map((dest, index) => (
            <FadeIn key={dest.name} delay={index * 80}>
              <article
                className={`grid gap-8 lg:grid-cols-2 lg:gap-16 lg:items-center ${
                  index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-charcoal/20" />
                </div>

                <div>
                  <h3 className="font-serif text-3xl font-light tracking-[0.1em] uppercase md:text-4xl">
                    {dest.name}
                  </h3>
                  <p className="mt-2 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-gold/70">
                    {dest.travelTime}
                  </p>

                  <div className="mt-8 space-y-6">
                    <div>
                      <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-ivory/40">
                        What to See
                      </p>
                      <p className="mt-2 font-sans text-sm leading-relaxed text-ivory/70 md:text-base">
                        {dest.see}
                      </p>
                    </div>
                    <div>
                      <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-ivory/40">
                        What to Eat
                      </p>
                      <p className="mt-2 font-sans text-sm leading-relaxed text-ivory/70 md:text-base">
                        {dest.eat}
                      </p>
                    </div>
                    <div>
                      <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-ivory/40">
                        Suggested Activities
                      </p>
                      <p className="mt-2 font-sans text-sm leading-relaxed text-ivory/70 md:text-base">
                        {dest.do}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
