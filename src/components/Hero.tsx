import Link from "next/link";
import { WEDDING } from "@/lib/constants";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-end justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[#2f3a2e]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(184,160,103,0.18),transparent_50%),linear-gradient(135deg,rgba(47,58,46,0.9)_0%,rgba(28,28,28,0.55)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/25 to-charcoal/40" />

      <div className="relative z-10 flex w-full flex-col items-center px-6 pb-20 pt-32 text-center text-ivory md:pb-24 md:pt-40">
        <div className="mb-8 flex flex-col items-center gap-1 md:gap-2">
          <h1 className="font-serif text-5xl font-light tracking-[0.08em] uppercase md:text-7xl lg:text-8xl">
            Janelle
          </h1>
          <span className="font-script text-3xl italic text-gold/90 md:text-4xl">&</span>
          <h1 className="font-serif text-5xl font-light tracking-[0.08em] uppercase md:text-7xl lg:text-8xl">
            Eric
          </h1>
        </div>

        <div className="mb-8 flex flex-col items-center gap-3 md:gap-4">
          <p className="font-sans text-xs uppercase tracking-[0.35em] text-ivory/90 md:text-sm">
            {WEDDING.date}
          </p>
          <div className="h-px w-12 bg-gold/50" />
          <p className="font-sans text-xs uppercase tracking-[0.35em] text-ivory/80 md:text-sm">
            {WEDDING.location}
          </p>
        </div>

        <p className="mb-14 max-w-md font-script text-xl italic text-ivory/75 md:text-2xl">
          Together with our favorite people.
        </p>

        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <a
            href="#guest-lounge"
            className="group inline-flex items-center gap-4 border border-ivory/40 bg-ivory/10 px-8 py-4 font-sans text-[0.65rem] uppercase tracking-[0.3em] text-ivory backdrop-blur-sm transition-all hover:border-ivory hover:bg-ivory hover:text-charcoal"
          >
            Enter the Guest Lounge
            <span className="block h-px w-6 bg-current transition-all group-hover:w-8" />
          </a>
          <a
            href="#intro"
            className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-ivory/60 transition-colors hover:text-ivory"
          >
            Explore the Weekend
          </a>
        </div>
      </div>
    </section>
  );
}
