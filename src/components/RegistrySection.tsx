import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function RegistrySection() {
  return (
    <section id="registry" className="bg-cream px-6 py-24 md:px-10 md:py-32 lg:px-16">
      <div className="mx-auto max-w-2xl text-center">
        <FadeIn>
          <SectionHeading label="Your Presence Is Our Greatest Gift" />
        </FadeIn>

        <FadeIn delay={150}>
          <p className="mx-auto mt-10 font-sans text-base leading-relaxed text-charcoal/70 md:text-lg">
            Having you with us in Italy is the only gift we need. For those who
            have asked, we have registered at the following — or you may contribute
            to our honeymoon fund for future adventures together.
          </p>
        </FadeIn>

        <FadeIn delay={250}>
          <div className="mt-12 space-y-6">
            <a
              href="#"
              className="group inline-flex items-center gap-4 border border-taupe/30 px-8 py-4 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-charcoal transition-all duration-300 hover:border-charcoal"
            >
              View Registry
              <span className="block h-px w-6 bg-current transition-all duration-300 group-hover:w-10" />
            </a>
            <p className="font-sans text-sm text-taupe">
              Honeymoon fund details coming soon
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
