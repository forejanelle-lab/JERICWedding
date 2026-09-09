import Link from "next/link";
import { LoungeLoginForm } from "@/components/lounge/LoungeLoginForm";
import { Monogram } from "@/components/ui/Monogram";

export default function LoungeLoginPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 md:px-10 lg:flex-row lg:items-center lg:gap-16 lg:py-16">
        <div className="mb-12 flex-1 lg:mb-0">
          <Link href="/" className="inline-block">
            <Monogram size="sm" />
          </Link>

          <p className="mt-10 font-script text-2xl italic text-taupe md:text-3xl">
            Welcome to the Guest Lounge
          </p>
          <h1 className="mt-4 font-serif text-4xl font-light tracking-[0.08em] text-charcoal uppercase md:text-5xl">
            Connect, Play & Get Excited
          </h1>
          <p className="mt-6 max-w-lg font-sans text-base leading-relaxed text-charcoal/70">
            Meet fellow guests, play wedding games, find travel buddies, and join
            the conversation before we gather in Campania. Invited guests only.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              "Play couple quizzes & icebreakers",
              "Find guests with similar travel plans",
              "Join discussions & photo challenges",
              "Earn points for connecting — not popularity",
            ].map((item) => (
              <div
                key={item}
                className="border border-taupe/15 bg-ivory/60 px-4 py-4 font-sans text-sm text-charcoal/70"
              >
                {item}
              </div>
            ))}
          </div>

          <Link
            href="/"
            className="mt-10 inline-block font-sans text-[0.65rem] uppercase tracking-[0.25em] text-taupe hover:text-charcoal"
          >
            ← Back to wedding site
          </Link>
        </div>

        <div className="w-full max-w-md flex-shrink-0">
          <LoungeLoginForm />
          <p className="mt-4 text-center font-sans text-xs text-taupe">
            Your invitation code was included with your wedding invite.
          </p>
        </div>
      </div>
    </div>
  );
}
