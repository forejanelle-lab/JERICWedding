import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";

export function PortalCta() {
  return (
    <section className="bg-charcoal px-6 py-24 text-ivory md:px-10 md:py-32 lg:px-16">
      <div className="mx-auto max-w-3xl text-center">
        <FadeIn>
          <p className="font-script text-xl italic text-ivory/50 md:text-2xl">
            For our guests
          </p>
          <h2 className="mt-4 font-serif text-3xl font-light tracking-[0.1em] uppercase md:text-4xl">
            Guest Portal
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-sans text-base leading-relaxed text-ivory/70">
            Connect with fellow guests before the wedding — coordinate rides
            between the airport and venue, join discussion boards, and get to
            know travelers coming from the US and Europe.
          </p>
          <Link
            href="/portal"
            className="mt-10 inline-flex items-center gap-4 border border-ivory/30 px-8 py-4 font-sans text-[0.65rem] uppercase tracking-[0.3em] text-ivory transition-all hover:border-ivory hover:bg-ivory hover:text-charcoal"
          >
            Enter Guest Portal
            <span className="block h-px w-6 bg-current" />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
