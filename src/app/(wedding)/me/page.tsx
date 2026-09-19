"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader, SectionWrap } from "@/components/site/PageHeader";
import { PLACES, STAY_LABELS } from "@/lib/hub/content";
import { guestName, useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { StayArea } from "@/lib/hub/types";
import { formatDate, formatTime } from "@/lib/hub/utils";
import { requestRideDigestUnsubscribe } from "@/lib/rides/client";

const STAY_AREAS = Object.keys(STAY_LABELS) as StayArea[];

export default function DashboardPage() {
  const { state, me, signOut, updateStay } = useHub();
  const { t, locale } = useI18n();

  if (!state.identity || !me) {
    return (
      <main className="pt-[calc(4.75rem+env(safe-area-inset-top))] md:pt-28">
        <SectionWrap>
          <PageHeader
            eyebrow="Personal, not public"
            title="My Weekend"
            description="Join the community to keep your RSVP, rides, Italy list, and game score in one place."
          />
          <div className="mt-10 flex justify-center">
            <Link href="/join?next=/me" className="btn-primary">
              {t("me.joinCommunity")}
            </Link>
          </div>
        </SectionWrap>
      </main>
    );
  }

  const myRsvp = state.rsvps.find((item) => item.email === state.identity?.email);
  const myRides = state.rides.filter((ride) => ride.authorId === me.id);
  const myAsks = state.seatAsks.filter((ask) => ask.fromGuestId === me.id);
  const saved = PLACES.filter((place) => state.savedPlaces.includes(place.id));
  const myPoints = me.points;

  return (
    <main className="pt-[calc(4.75rem+env(safe-area-inset-top))] md:pt-28">
      <SectionWrap className="bg-ivory">
        <p className="text-center font-script text-2xl italic text-taupe">{t("me.hi", { name: me.firstName })}</p>
        <h1 className="mt-2 text-center font-serif text-4xl font-light tracking-[0.1em] uppercase">{t("me.yourWeekend")}</h1>
      </SectionWrap>

      <SectionWrap className="bg-cream">
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
          <article className="soft-card p-6">
            <p className="label-caps">{t("me.rsvp")}</p>
            <p className="mt-3 font-serif text-2xl">{myRsvp ? (myRsvp.attending ? t("me.confirmed") : t("me.regrets")) : t("me.notSubmitted")}</p>
            <ul className="mt-4 space-y-1 font-sans text-sm text-charcoal/70">
              {me.events.map((event) => (
                <li key={event}>✓ {t(`event.${event}`)}</li>
              ))}
            </ul>
            <Link href="/rsvp" className="mt-4 inline-block font-sans text-[0.65rem] uppercase tracking-[0.18em] text-olive">
              {t("me.updateRsvp")}
            </Link>
          </article>

          <article className="soft-card p-6">
            <p className="label-caps">{t("me.travel")}</p>
            <p className="mt-3 font-sans text-sm text-charcoal/70">
              {me.arrivalAirport ? t("me.flyingInto", { airport: me.arrivalAirport }) : t("me.airportNot")}
            </p>
            <p className="mt-1 font-sans text-sm text-charcoal/70">
              {me.arrivalDate ? t("me.arriving", { date: formatDate(me.arrivalDate, locale) }) : ""}
            </p>
            <p className="mt-1 font-sans text-sm text-charcoal/70">
              {t("me.stayingIn", { place: me.stay ? t(`stay.${me.stay}`) : t("me.areaTbd") })}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {STAY_AREAS.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => updateStay(area)}
                  className={`rounded-full border px-3 py-1.5 font-sans text-[0.55rem] uppercase tracking-[0.14em] ${
                    me.stay === area ? "border-forest bg-forest text-ivory" : "border-taupe/20"
                  }`}
                >
                  {t(`stay.${area}`)}
                </button>
              ))}
            </div>
          </article>

          <article className="soft-card p-6">
            <p className="label-caps">{t("me.rides")}</p>
            {myRides.length === 0 && myAsks.length === 0 ? (
              <p className="mt-3 font-sans text-sm text-charcoal/70">{t("me.noneYet")}</p>
            ) : (
              <ul className="mt-3 space-y-2 font-sans text-sm text-charcoal/70">
                {myRides.map((ride) => (
                  <li key={ride.id}>
                    {ride.from} → {ride.to} · {formatDate(ride.date, locale)} {formatTime(ride.time, locale)}
                  </li>
                ))}
                {myAsks.map((ask) => (
                  <li key={ask.id}>{t("me.seatRequest", { status: t(`status.${ask.status}`) })}</li>
                ))}
              </ul>
            )}
            <Link href="/rides" className="mt-4 inline-block font-sans text-[0.65rem] uppercase tracking-[0.18em] text-olive">
              {t("me.rideBoard")}
            </Link>
          </article>

          <article className="soft-card p-6">
            <p className="label-caps">{t("me.italyList")}</p>
            <p className="mt-3 font-serif text-2xl">{t("me.savedPlaces", { n: saved.length })}</p>
            <ul className="mt-3 space-y-1 font-sans text-sm text-charcoal/70">
              {saved.slice(0, 4).map((place) => (
                <li key={place.id}>{place.name}</li>
              ))}
            </ul>
            <Link href="/things-to-do" className="mt-4 inline-block font-sans text-[0.65rem] uppercase tracking-[0.18em] text-olive">
              {t("me.browsePlaces")}
            </Link>
          </article>

          <article className="soft-card p-6">
            <p className="label-caps">{t("me.gameScore")}</p>
            <p className="mt-3 font-serif text-4xl">{myPoints.toLocaleString()}</p>
            <p className="mt-2 font-sans text-sm text-taupe">{t("me.signedIn", { name: guestName(me) })}</p>
            <Link href="/leaderboard" className="mt-4 inline-block font-sans text-[0.65rem] uppercase tracking-[0.18em] text-olive">
              {t("me.leaderboard")}
            </Link>
          </article>
        </div>
        <div className="mt-10 space-y-3 text-center">
          {state.identity.email ? <RideEmailOptOut email={state.identity.email} /> : null}
          <button type="button" className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-taupe" onClick={() => void signOut()}>
            {t("me.signOut")}
          </button>
        </div>
      </SectionWrap>
    </main>
  );
}

function RideEmailOptOut({ email }: { email: string }) {
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  if (done) {
    return <p className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-olive">{t("me.unsubscribedRides")}</p>;
  }
  return (
    <button
      type="button"
      disabled={busy}
      className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-taupe"
      onClick={() => {
        setBusy(true);
        void requestRideDigestUnsubscribe(email)
          .then(() => setDone(true))
          .finally(() => setBusy(false));
      }}
    >
      {t("me.unsubscribeRides")}
    </button>
  );
}
