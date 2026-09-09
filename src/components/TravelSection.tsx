import Image from "next/image";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

const TRAVEL_SECTIONS = [
  {
    title: "Getting There",
    content:
      "Fly into Naples International Airport (NAP), served by major carriers from the US, UK, and across Europe. From the airport, the venue is approximately 45 minutes by car. High-speed trains also connect Rome and Naples if you prefer to arrive by rail.",
  },
  {
    title: "Where to Stay",
    content:
      "We recommend staying in Naples for easy access to the airport and our recommended hotels, or along the Amalfi Coast for a longer Italian holiday. See our Accommodations section below for curated options.",
  },
  {
    title: "Transportation",
    content:
      "Private car service, taxi, or rental car are all viable options. Shuttle service between select hotels and wedding events will be provided — details to follow. For coastal drives, we recommend hiring a local driver.",
  },
  {
    title: "Things to Do",
    content:
      "Extend your stay to explore Pompeii, Capri, the Amalfi Coast, or a day trip to Rome. Our Campania Guide below offers inspiration for making the most of your time in southern Italy.",
  },
] as const;

export function TravelSection() {
  return (
    <section id="travel" className="bg-cream px-6 py-24 md:px-10 md:py-32 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <SectionHeading label="Come to Italy With Us" script="Travel & arrival" />
        </FadeIn>

        <div className="mt-16 grid gap-16 lg:grid-cols-2 lg:gap-20">
          <FadeIn delay={100}>
            <div className="space-y-12">
              {TRAVEL_SECTIONS.map((section) => (
                <article key={section.title}>
                  <h3 className="font-sans text-[0.65rem] uppercase tracking-[0.3em] text-olive">
                    {section.title}
                  </h3>
                  <p className="mt-4 font-sans text-base leading-relaxed text-charcoal/70">
                    {section.content}
                  </p>
                </article>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden border border-taupe/20">
                <Image
                  src="/images/travel-landscape.jpg"
                  alt="Scenic Italian landscape"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              <div className="mt-6 overflow-hidden border border-taupe/20">
                <iframe
                  title="Map of Campania, Italy"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=13.8%2C40.2%2C15.5%2C41.5&layer=mapnik&marker=41.0%2C14.5"
                  className="h-64 w-full grayscale-[30%] contrast-[0.95] md:h-80"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <p className="mt-3 text-center font-sans text-xs text-taupe">
                Campania, Italy — wedding venue region
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
