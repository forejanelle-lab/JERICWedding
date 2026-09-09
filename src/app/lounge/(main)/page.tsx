import Link from "next/link";
import { getLoungeSession } from "@/lib/lounge/auth";
import { WEDDING } from "@/lib/constants";
import { ActivityCard } from "@/components/lounge/ActivityCard";
import { LoungePageHeader } from "@/components/lounge/LoungePageHeader";
import { TodayPoll } from "@/components/lounge/TodayPoll";
import { Countdown } from "@/components/Countdown";
import {
  COMMUNITY_FEED,
  LEADERBOARD,
  NEXT_UP_ACTIVITIES,
  RECOMMENDED_GUESTS,
  SECRET_MISSIONS,
  UPCOMING_EVENTS,
} from "@/lib/lounge/constants";

export default async function LoungeHomePage() {
  const session = await getLoungeSession();
  const firstName = session?.guestName.split(" ")[0] ?? "Guest";

  return (
    <div>
      <section className="mb-12 border border-taupe/15 bg-ivory p-8 md:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-olive">
              Guest Lounge
            </p>
            <h1 className="mt-3 font-serif text-3xl font-light tracking-[0.08em] text-charcoal uppercase md:text-4xl">
              Welcome, {firstName}
            </h1>
            <p className="mt-4 max-w-xl font-sans text-base leading-relaxed text-charcoal/70">
              Connect, play, and get excited together before we say &ldquo;I do&rdquo;
              in Italy.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:min-w-[420px]">
            {[
              { label: "RSVP Status", value: "Pending" },
              { label: "Your Points", value: "120" },
              { label: "Rank", value: "#8" },
            ].map((stat) => (
              <div key={stat.label} className="border border-taupe/15 px-4 py-4 text-center">
                <p className="font-sans text-[0.55rem] uppercase tracking-[0.2em] text-taupe">
                  {stat.label}
                </p>
                <p className="mt-2 font-serif text-2xl text-charcoal">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border border-taupe/10 px-4 py-8">
          <Countdown />
        </div>
      </section>

      <LoungePageHeader
        title="Your Next Up"
        script="Curated for you"
        description="We surface games, challenges, and connections so you never wonder what to do next."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {NEXT_UP_ACTIVITIES.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-sans text-[0.65rem] uppercase tracking-[0.25em] text-olive">
              People You Might Want to Meet
            </h2>
            <Link
              href="/lounge/members"
              className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-taupe hover:text-charcoal"
            >
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {RECOMMENDED_GUESTS.map((guest) => (
              <article
                key={guest.id}
                className="flex flex-col gap-4 border border-taupe/15 bg-ivory p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-serif text-xl text-charcoal">{guest.name}</h3>
                  <p className="mt-1 font-sans text-sm text-taupe">{guest.city}</p>
                  <p className="mt-2 font-sans text-sm text-charcoal/70">{guest.reason}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {guest.interests.map((interest) => (
                      <span
                        key={interest}
                        className="border border-olive/15 px-2 py-1 font-sans text-[0.55rem] uppercase tracking-[0.15em] text-olive"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href="/lounge/messages"
                  className="inline-flex shrink-0 items-center gap-3 border border-charcoal px-5 py-3 font-sans text-[0.6rem] uppercase tracking-[0.2em] text-charcoal transition-colors hover:bg-charcoal hover:text-ivory"
                >
                  Say Hello
                </Link>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <TodayPoll />

          <section className="border border-taupe/20 bg-ivory p-6">
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-olive">
              Secret Missions
            </p>
            <ul className="mt-4 space-y-3">
              {SECRET_MISSIONS.slice(0, 3).map((mission) => (
                <li
                  key={mission.id}
                  className="flex items-start justify-between gap-4 border-b border-taupe/10 pb-3 last:border-0 last:pb-0"
                >
                  <span className="font-sans text-sm text-charcoal/75">{mission.title}</span>
                  <span className="shrink-0 font-sans text-xs text-gold">+{mission.points}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/lounge/challenges"
              className="mt-5 inline-block font-sans text-[0.6rem] uppercase tracking-[0.2em] text-taupe hover:text-charcoal"
            >
              View all missions
            </Link>
          </section>

          <section className="border border-taupe/20 bg-forest p-6 text-ivory">
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-gold/80">
              Leaderboard
            </p>
            <ol className="mt-4 space-y-2">
              {LEADERBOARD.slice(0, 3).map((entry) => (
                <li
                  key={entry.rank}
                  className="flex items-center justify-between font-sans text-sm text-ivory/85"
                >
                  <span>
                    {entry.rank}. {entry.name}
                  </span>
                  <span className="text-ivory/50">{entry.points}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 font-sans text-xs text-ivory/50">
              You&apos;re 50 points away from #7
            </p>
            <Link
              href="/lounge/leaderboard"
              className="mt-4 inline-block font-sans text-[0.6rem] uppercase tracking-[0.2em] text-ivory/70 hover:text-ivory"
            >
              Full leaderboard
            </Link>
          </section>
        </aside>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-sans text-[0.65rem] uppercase tracking-[0.25em] text-olive">
              Upcoming Events
            </h2>
          </div>
          <div className="space-y-4">
            {UPCOMING_EVENTS.map((event) => (
              <Link
                key={event.id}
                href={event.href}
                className="block border border-taupe/15 bg-ivory p-5 transition-colors hover:border-charcoal/20"
              >
                <p className="font-serif text-xl text-charcoal">{event.title}</p>
                <p className="mt-1 font-sans text-sm text-taupe">
                  {event.date} · {event.time}
                </p>
                <p className="mt-3 font-sans text-xs uppercase tracking-[0.15em] text-olive">
                  {event.attending} guests attending
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-sans text-[0.65rem] uppercase tracking-[0.25em] text-olive">
              Community Activity
            </h2>
            <Link
              href="/lounge/community"
              className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-taupe hover:text-charcoal"
            >
              View feed
            </Link>
          </div>
          <div className="space-y-4">
            {COMMUNITY_FEED.map((post) => (
              <article key={post.id} className="border border-taupe/15 bg-ivory p-5">
                <p className="font-sans text-[0.55rem] uppercase tracking-[0.2em] text-taupe">
                  {post.prompt}
                </p>
                <p className="mt-3 font-sans text-sm leading-relaxed text-charcoal/80">
                  {post.body}
                </p>
                <p className="mt-4 font-sans text-xs text-taupe">
                  {post.author} · {post.city} · {post.time}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <p className="mt-12 text-center font-sans text-xs text-taupe">
        {WEDDING.venue} · {WEDDING.date}
      </p>
    </div>
  );
}
