import { OliveBranch } from "@/components/ui/OliveBranch";
import { FadeIn } from "@/components/ui/FadeIn";
import { Countdown } from "@/components/Countdown";

export function IntroSection() {
  return (
    <section id="intro" className="bg-ivory px-6 py-24 md:px-10 md:py-32 lg:px-16">
      <div className="mx-auto max-w-3xl text-center">
        <FadeIn>
          <OliveBranch className="mx-auto mb-10" />
        </FadeIn>

        <FadeIn delay={100}>
          <h2 className="mb-10 font-serif text-3xl font-light leading-snug tracking-[0.1em] text-charcoal uppercase md:text-4xl lg:text-5xl">
            We Can&apos;t Wait to Celebrate
            <br />
            With You in Italy
          </h2>
        </FadeIn>

        <FadeIn delay={200}>
          <p className="mx-auto mb-16 max-w-xl font-sans text-base leading-relaxed text-charcoal/70 md:text-lg">
            Surrounded by ancient stone, olive groves, and the warmth of Campania,
            we invite you to join us for a weekend of love, laughter, and la dolce
            vita. Your presence would mean the world to us as we begin this new
            chapter together in the heart of the Italian countryside.
          </p>
        </FadeIn>

        <FadeIn delay={300}>
          <div className="border border-taupe/20 px-6 py-12 md:px-12 md:py-16">
            <Countdown />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
