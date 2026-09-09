import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NEXT_UP_ACTIVITIES } from "@/lib/lounge/constants";

export function GuestLoungeSection() {
  return (
    <section
      id="guest-lounge"
      className="relative overflow-hidden bg-forest px-6 py-24 text-ivory md:px-10 md:py-32 lg:px-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(184,160,103,0.12),transparent_45%)]" />

      <div className="relative mx-auto max-w-6xl">
        <FadeIn>
          <SectionHeading
            label="The Guest Lounge"
            script="Because we don't want you to just come to our wedding"
            className="text-ivory [&_h2]:text-ivory [&_p]:text-ivory/50"
          />
        </FadeIn>

        <FadeIn delay={100}>
          <p className="mx-auto mt-8 max-w-2xl text-center font-sans text-base leading-relaxed text-ivory/75 md:text-lg">
            We want you to know the people you&apos;re celebrating with. Meet fellow
            guests, play games, find travel buddies, share tips, and build excitement
            together before we say &ldquo;I do&rdquo; in Italy.
          </p>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {NEXT_UP_ACTIVITIES.slice(0, 4).map((activity) => (
              <div
                key={activity.id}
                className="group border border-ivory/10 bg-ivory/[0.04] p-6 backdrop-blur-sm transition-all duration-500 hover:border-gold/30 hover:bg-ivory/[0.08]"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl" aria-hidden="true">
                    {activity.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-[0.55rem] uppercase tracking-[0.25em] text-gold/80">
                      Your Next Up
                    </p>
                    <h3 className="mt-2 font-serif text-xl font-light tracking-[0.06em] text-ivory uppercase">
                      {activity.title}
                    </h3>
                    <p className="mt-2 font-sans text-sm text-ivory/60">
                      {activity.subtitle}
                    </p>
                    <p className="mt-1 font-sans text-xs text-ivory/45">{activity.meta}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={300}>
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/lounge/login"
              className="group inline-flex items-center gap-4 border border-ivory/30 bg-ivory px-8 py-4 font-sans text-[0.65rem] uppercase tracking-[0.3em] text-charcoal transition-all hover:bg-transparent hover:text-ivory"
            >
              Enter the Guest Lounge
              <span className="block h-px w-6 bg-current transition-all group-hover:w-8" />
            </Link>
            <p className="max-w-sm text-center font-sans text-xs leading-relaxed text-ivory/50 sm:text-left">
              Invited guests only · Use your invitation code to join
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
