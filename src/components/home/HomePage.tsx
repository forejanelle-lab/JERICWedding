"use client";

import Link from "next/link";
import { useState } from "react";
import { EditImage } from "@/components/site/EditImage";
import { EditText } from "@/components/site/EditText";
import { EventPopup } from "@/components/site/EventPopup";
import { canSeeEvent, canSeePage, isWeekendEventHidden } from "@/lib/hub/access";
import { WEEKEND_EVENTS } from "@/lib/hub/content";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const ACTIONS = [
  {
    href: "/rsvp",
    title: "RSVP",
    body: "Kindly RSVP by June 1, 2027",
    icon: "envelope",
  },
  {
    href: "/weekend",
    title: "Weekend Events",
    body: "All the details you need to know",
    icon: "glasses",
  },
  {
    href: "/travel",
    title: "Travel Guide",
    body: "Airports, stays, transportation & more",
    icon: "pin",
  },
  {
    href: "/rides",
    title: "Ride Request",
    body: "Request or offer a ride with other guests",
    icon: "car",
  },
] as const;

const TIMELINE = [
  { day: "Saturday, September 4", title: "Welcome Party", note: "Let's kick off the weekend!", icon: "glasses", eventId: "welcome" },
  { day: "Sunday, September 5", title: "The Wedding Day ♥", note: "We get married!", icon: "ring", eventId: "ceremony" },
  { day: "Monday, September 6", title: "Goodbye Brunch", note: "One last toast together", icon: "cup", eventId: "brunch" },
] as const;

export function HomePage({ guestFirstName = "" }: { guestFirstName?: string }) {
  const { state } = useHub();
  const { t } = useI18n();
  const firstName = (guestFirstName || state.identity?.firstName || "").trim();
  const timeline = TIMELINE.filter(
    (event) => canSeeEvent(state, event.eventId) && !isWeekendEventHidden(state, event.eventId),
  );
  const actions = ACTIONS.filter((card) => canSeePage(state, card.href));
  const showPlay = canSeePage(state, "/play");
  const showTravel = canSeePage(state, "/travel");
  const [openId, setOpenId] = useState<string | null>(null);
  const openEvent =
    WEEKEND_EVENTS.find(
      (event) =>
        event.id === openId && canSeeEvent(state, event.id) && !isWeekendEventHidden(state, event.id),
    ) ?? null;
  return (
    <main className="bg-[#F9F7F2] pb-8 pt-[calc(4.75rem+env(safe-area-inset-top))] text-[#242424] md:pb-20 md:pt-[3.4rem]">
      <div className="mx-auto max-w-[1320px] px-5 md:px-8 lg:px-12">
        <section className="grid items-end gap-4 py-8 md:grid-cols-2 md:gap-12 md:py-10">
          <div>
            <div className="font-hand text-2xl text-[#2D3B2D] md:text-3xl">
              <EditText id="home.helloName" as="span" className="font-hand text-2xl text-[#2D3B2D] md:text-3xl">
                Benvenuti
              </EditText>
              {firstName ? (
                <>
                  {", "}
                  <strong className="font-bold">{firstName}</strong>
                </>
              ) : null}
              !
            </div>
            <EditText id="home.title" as="h1" className="mt-1 font-serif text-[2.15rem] font-light leading-tight tracking-[0.04em] text-[#242424] uppercase md:text-5xl md:tracking-[0.06em]">
              The Weekend
            </EditText>
            <EditText id="home.dates" as="p" className="mt-2 max-w-[16rem] font-sans text-[0.72rem] uppercase leading-relaxed tracking-[0.12em] text-[#77736C] md:max-w-none md:text-[0.62rem] md:tracking-[0.2em]">
              September 4–6, 2027 · Campania, Italy
            </EditText>
          </div>
          <div className="md:text-right">
            <EditText id="home.welcome" as="p" className="font-serif text-xl font-light leading-snug text-[#242424] md:text-2xl">
              We can&apos;t wait to celebrate with you.
            </EditText>
            <MiniBranch className="mt-3 h-6 w-24 text-[#2D3B2D]/50 md:ml-auto" />
          </div>
        </section>

        <section className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${actions.length >= 4 ? "lg:grid-cols-4" : actions.length === 3 ? "lg:grid-cols-3" : ""} lg:gap-6`}>
          {actions.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex min-h-[176px] flex-col rounded-[20px] border border-[#E6E0D7] bg-[#F5F1E9] px-6 py-6 transition duration-200 hover:-translate-y-0.5 hover:border-[#2D3B2D]/25 md:min-h-[196px] md:px-7 md:py-7"
            >
              <ActionIcon name={card.icon} />
              <EditText id={`home.card.${card.href}.title`} as="h2" className="mt-4 font-serif text-2xl font-light leading-tight tracking-[0.02em] text-[#242424]">
                {card.title}
              </EditText>
              <EditText id={`home.card.${card.href}.body`} as="p" className="mt-2 font-sans text-sm leading-snug text-[#77736C]">
                {card.body}
              </EditText>
              <span className="mt-4 font-serif text-xl text-[#242424] transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>
          ))}
        </section>

        {showPlay || showTravel ? (
        <section className={`mt-8 grid gap-6 lg:mt-10 ${showPlay && showTravel ? "lg:grid-cols-2" : ""}`}>
          {showPlay ? (
          <Link
            href="/play/know-us"
            className="group relative overflow-hidden rounded-[20px] bg-[#2D3B2D] px-5 py-7 text-[#F9F7F2] md:min-h-[280px] md:px-9 md:py-10"
          >
            <EditText id="home.quiz.kicker" as="p" className="font-sans text-[0.7rem] uppercase tracking-[0.16em] text-[#F9F7F2]/70 md:text-[0.62rem] md:tracking-[0.22em]">
              Play along
            </EditText>
            <EditText id="home.quiz.title" as="h2" className="mt-4 max-w-[13.5rem] font-serif text-[2rem] font-light leading-[1.1] md:max-w-[12rem] md:text-[2.6rem]">
              Who said I love you first?
            </EditText>
            <EditText id="home.quiz.sub" as="p" className="mt-4 max-w-[14rem] font-sans text-[0.72rem] uppercase leading-relaxed tracking-[0.12em] text-[#F9F7F2]/70 md:max-w-[11rem] md:text-[0.62rem] md:tracking-[0.16em]">
              How well do you know the couple?
            </EditText>
            <span className="mt-7 inline-flex min-h-11 items-center rounded-md border border-[#F9F7F2]/45 px-4 py-2.5 font-sans text-[0.7rem] uppercase tracking-[0.14em] transition-colors duration-200 group-hover:border-[#F9F7F2] group-hover:bg-[#F9F7F2]/10 md:mt-8 md:text-[0.62rem] md:tracking-[0.16em]">
              {t("home.quiz.cta")}
              <span className="ml-2 transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </span>
            <div className="pointer-events-none absolute -right-3 bottom-4 hidden w-[38%] max-w-[180px] rotate-[8deg] sm:right-6 sm:bottom-8 sm:block">
              <div className="rounded-sm bg-[#F9F7F2] p-2 pb-7 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#E6E0D7]">
                  <EditImage id="home.quiz.photo" src="/images/couple-hero.jpg" alt="Janelle and Eric" fill className="object-cover" sizes="180px" />
                </div>
              </div>
              <HeartDoodle className="absolute -left-5 top-8 h-7 w-7 text-[#F9F7F2]" />
            </div>
          </Link>
          ) : null}

          {showTravel ? (
          <Link href="/travel" className="group relative min-h-[280px] overflow-hidden rounded-[20px]">
            <EditImage id="home.travel.photo" src="/images/casale-bosco.jpg" alt="" fill className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" sizes="(min-width: 1024px) 50vw, 100vw" />
            <div className="relative m-4 max-w-md rounded-[18px] bg-[#F9F7F2]/95 p-5 md:m-7 md:p-8">
              <EditText id="home.travel.hand" as="p" className="font-hand text-2xl text-[#2D3B2D] md:text-3xl">
                we&apos;re so happy
              </EditText>
              <EditText id="home.travel.title" as="h2" className="mt-1 font-serif text-[2rem] font-light leading-tight tracking-[0.04em] uppercase md:text-5xl md:tracking-[0.06em]">
                You&apos;re here
              </EditText>
              <div className="my-4 h-px w-16 bg-[#E6E0D7]" />
              <EditText id="home.travel.body" as="p" multiline className="max-w-xs font-sans text-sm leading-relaxed text-[#77736C]">
                All the information you need for a seamless weekend in Italy.
              </EditText>
              <span className="mt-6 inline-flex rounded-full bg-[#2D3B2D] px-5 py-2.5 font-sans text-[0.62rem] uppercase tracking-[0.16em] text-[#F9F7F2] transition-colors duration-200 group-hover:bg-[#3d4f3d]">
                {t("home.travel.cta")}
              </span>
            </div>
            <Botanical className="pointer-events-none absolute -bottom-4 -right-2 h-36 w-36 text-[#2D3B2D]/80 md:h-44 md:w-44" />
          </Link>
          ) : null}
        </section>
        ) : null}

        <section className="mt-8 grid items-stretch gap-6 lg:mt-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[20px] border border-[#E6E0D7] bg-[#F5F1E9] px-6 py-8 md:px-8 md:py-10">
            <EditText id="home.timeline.kicker" as="p" className="font-hand text-3xl text-[#2D3B2D]">
              the weekend
            </EditText>
            <ol className="relative mt-5 space-y-0">
              {timeline.map((event, index) => (
                <li key={event.day} className="group relative flex gap-4 pb-5 last:pb-0">
                  {index < timeline.length - 1 ? (
                    <span className="absolute left-[17px] top-9 h-[calc(100%-12px)] w-px bg-[#E6E0D7]" />
                  ) : null}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setOpenId(event.eventId)}
                    onKeyDown={(keyboard) => {
                      if (keyboard.key === "Enter" || keyboard.key === " ") {
                        keyboard.preventDefault();
                        setOpenId(event.eventId);
                      }
                    }}
                    className="relative z-[1] flex min-w-0 flex-1 cursor-pointer gap-4 text-left"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E6E0D7] bg-[#F9F7F2] text-[#2D3B2D] transition-colors duration-200 group-hover:border-[#2D3B2D]/30">
                      <TimelineIcon name={event.icon} />
                    </span>
                    <div>
                      <EditText id={`home.timeline.${event.day}.day`} as="p" className="font-sans text-[0.72rem] uppercase tracking-[0.12em] text-[#77736C] md:text-[0.58rem] md:tracking-[0.18em]">
                        {event.day}
                      </EditText>
                      <EditText id={`home.timeline.${event.day}.title`} as="p" className="mt-1 font-serif text-xl font-medium text-[#242424]">
                        {event.title}
                      </EditText>
                      <EditText id={`home.timeline.${event.day}.note`} as="p" className="mt-0.5 font-sans text-sm text-[#77736C]">
                        {event.note}
                      </EditText>
                      <p className="mt-1 font-sans text-[0.55rem] uppercase tracking-[0.16em] text-[#2D3B2D]/70">{t("home.timeline.more")}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <Link
              href="/weekend"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#2D3B2D] px-6 py-3.5 font-sans text-[0.62rem] uppercase tracking-[0.18em] text-[#F9F7F2] transition-colors duration-200 hover:bg-[#3d4f3d]"
            >
              {t("home.timeline.cta")}
            </Link>
          </div>

          <div className="relative min-h-[320px] overflow-hidden rounded-[20px] lg:min-h-full">
            <EditImage
              id="home.schedule.photo"
              src="/images/casale-bosco.jpg"
              alt="Woodland at Casale dei Mascioni"
              fill
              className="object-cover transition-transform duration-300 hover:scale-[1.03]"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </div>
        </section>

        <section className="mt-8 rounded-[20px] border border-[#E6E0D7] bg-[#F5F1E9] px-6 py-8 md:mt-10 md:px-10">
          <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
            <EditText id="home.songs.quote" as="p" multiline className="flex-1 font-serif text-2xl font-light leading-snug text-[#242424] md:text-3xl">
              We can&apos;t wait to make memories with our favorite people.
            </EditText>
            <HeartDoodle className="h-8 w-8 shrink-0 text-[#2D3B2D]/70" />
            <div className="flex flex-1 flex-col items-center gap-2 lg:items-end">
              <EditText id="home.songs.kicker" as="p" className="font-sans text-[0.62rem] uppercase tracking-[0.2em] text-[#77736C]">
                Help us fill the floor
              </EditText>
              <EditText id="home.songs.title" as="p" className="font-serif text-xl font-light text-[#242424]">
                Request a song
              </EditText>
              <Link
                href="/songs"
                className="mt-1 inline-flex items-center gap-2 rounded-full bg-[#2D3B2D] px-5 py-2.5 font-sans text-[0.62rem] uppercase tracking-[0.16em] text-[#F9F7F2] transition-colors duration-200 hover:bg-[#3d4f3d]"
              >
                {t("home.songs.cta")}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
      {openEvent ? <EventPopup event={openEvent} onClose={() => setOpenId(null)} /> : null}
    </main>
  );
}

function ActionIcon({ name }: { name: string }) {
  const className = "h-7 w-7 text-[#2D3B2D]";
  if (name === "glasses") {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M9 20c0 2.2-1.6 4-3.5 4S2 22.2 2 20s1.6-4 3.5-4 3.5 1.8 3.5 4z" />
        <path d="M23 20c0 2.2 1.6 4 3.5 4s3.5-1.8 3.5-4-1.6-4-3.5-4-3.5 1.8-3.5 4z" />
        <path d="M9 20c1.5-6 4-12 7-16M23 20c-1.5-6-4-12-7-16" />
        <path d="M12 11h8" />
      </svg>
    );
  }
  if (name === "pin") {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M16 29s-9-8.2-9-14.5a9 9 0 1 1 18 0C25 20.8 16 29 16 29z" />
        <circle cx="16" cy="14" r="3" />
      </svg>
    );
  }
  if (name === "envelope") {
    return (
      <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="4" y="9" width="24" height="16" rx="1.5" />
        <path d="m5 10 11 8 11-8" />
        <path d="M22 7c0 2 .8 3.5 2 4.5" />
        <path d="M22 7c.4-1.2 1.4-2 2.6-2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M6 19h20l1.5-6-4-5H10L5 13z" />
      <circle cx="10" cy="20.5" r="2" />
      <circle cx="22" cy="20.5" r="2" />
    </svg>
  );
}

function TimelineIcon({ name }: { name: string }) {
  const className = "h-4 w-4";
  if (name === "branch") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M4 14c5 0 7-6 12-6 3 0 5 2 8 2" />
        <ellipse cx="10" cy="9" rx="2" ry="1.1" fill="currentColor" opacity="0.45" />
        <ellipse cx="14" cy="11" rx="1.7" ry="1" fill="currentColor" opacity="0.35" />
      </svg>
    );
  }
  if (name === "glasses") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="7" cy="16" r="3" />
        <circle cx="17" cy="16" r="3" />
        <path d="M7 16c1-5 3-10 5-13M17 16c-1-5-3-10-5-13" />
      </svg>
    );
  }
  if (name === "ring") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="12" cy="14" r="5" />
        <path d="M9 10 12 6l3 4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M6 11h12v2a6 6 0 0 1-12 0z" />
      <path d="M9 11V8a3 3 0 0 1 6 0" />
    </svg>
  );
}

function MiniBranch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 32" className={className} fill="none" aria-hidden>
      <path d="M4 18c16 0 24-8 36-8s20 8 36 8 24-8 40-8" stroke="currentColor" strokeWidth="0.8" />
      <ellipse cx="30" cy="12" rx="4" ry="2" fill="currentColor" opacity="0.45" />
      <ellipse cx="42" cy="16" rx="3.5" ry="1.8" fill="currentColor" opacity="0.35" />
      <ellipse cx="78" cy="12" rx="4" ry="2" fill="currentColor" opacity="0.45" />
      <ellipse cx="92" cy="16" rx="3.5" ry="1.8" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

function HeartDoodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
      <path d="M12 20s-7-4.2-7-9.2A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.8c0 5-7 9.2-7 9.2z" />
    </svg>
  );
}

function Botanical({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" className={className} fill="none" aria-hidden>
      <path d="M30 150c20-40 28-70 40-110 8 28 22 48 50 70" stroke="currentColor" strokeWidth="1.1" />
      <ellipse cx="58" cy="70" rx="10" ry="18" transform="rotate(-30 58 70)" fill="currentColor" opacity="0.35" />
      <ellipse cx="78" cy="52" rx="9" ry="16" transform="rotate(20 78 52)" fill="currentColor" opacity="0.28" />
      <ellipse cx="96" cy="88" rx="11" ry="18" transform="rotate(-10 96 88)" fill="currentColor" opacity="0.32" />
      <ellipse cx="112" cy="70" rx="8" ry="14" transform="rotate(25 112 70)" fill="currentColor" opacity="0.25" />
      <circle cx="84" cy="96" r="5" fill="currentColor" opacity="0.4" />
      <circle cx="102" cy="108" r="4.5" fill="currentColor" opacity="0.35" />
    </svg>
  );
}
