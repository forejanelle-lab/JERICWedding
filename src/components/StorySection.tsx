import Image from "next/image";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function StorySection() {
  return (
    <section id="story" className="bg-cream px-6 py-24 md:px-10 md:py-32 lg:px-16">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-20 lg:items-center">
        <FadeIn className="relative aspect-[3/4] overflow-hidden lg:aspect-[4/5]">
          <Image
            src="/images/couple-story.jpg"
            alt="Janelle and Eric walking together at golden hour"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </FadeIn>

        <div className="flex flex-col justify-center lg:py-12">
          <FadeIn delay={100}>
            <SectionHeading label="Our Story" align="left" />
          </FadeIn>

          <FadeIn delay={200}>
            <div className="mt-10 space-y-6 font-sans text-base leading-relaxed text-charcoal/70 md:text-lg">
              <p>
                From a chance meeting that felt like destiny to countless adventures
                across cities and coastlines, our story has always been written in
                moments of quiet intimacy and shared wonder.
              </p>
              <p>
                Janelle brings warmth, creativity, and an eye for beauty in every
                detail. Eric brings steady devotion, laughter, and the kind of
                partnership that makes ordinary days feel extraordinary. Together,
                we&apos;ve built a life rooted in love, travel, and the belief that
                the best celebrations are the ones shared with the people who
                matter most.
              </p>
              <p>
                Italy has always held a special place in our hearts — its art,
                its food, its unhurried elegance. Choosing Campania for our wedding
                feels like coming home to the place where our next chapter begins.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={300}>
            <p className="mt-10 font-script text-2xl italic text-taupe md:text-3xl">
              With love, always
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
