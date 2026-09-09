"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EVENT_LABELS, STAY_LABELS } from "@/lib/hub/content";
import { DEFAULT_GUEST_TAGS, EVENT_ACCESS, EVENT_ID_TAG, hasTagAccess, inviteTags, isWeekendEventHidden } from "@/lib/hub/access";
import { PageHeader, SectionWrap } from "@/components/site/PageHeader";
import { householdNames, lookupInvites, useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { EventId, InviteRecord, StayArea } from "@/lib/hub/types";
import { formatDate, formatTime } from "@/lib/hub/utils";

export default function RsvpPage() {
  const { submitRsvp, state } = useHub();
  const { t, locale } = useI18n();
  function eventsForInvite(record: InviteRecord | null) {
    const tags = inviteTags(record, state);
    return (Object.keys(EVENT_LABELS) as EventId[]).filter((event) => {
      if (isWeekendEventHidden(state, event)) return false;
      if (tags.includes(event)) return true;
      return hasTagAccess(tags, EVENT_ACCESS[event] ?? [EVENT_ID_TAG[event]]);
    });
  }
  const [query, setQuery] = useState("");
  const [invite, setInvite] = useState<InviteRecord | null>(null);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const matches = useMemo(() => lookupInvites(state.invites, query), [state.invites, query]);
  const names = invite ? householdNames(invite) : [];
  const showTravel = invite ? !invite.inItaly : true;
  const allowedEvents = eventsForInvite(invite);

  const [form, setForm] = useState({
    name: "",
    email: "",
    attending: true,
    events: ["welcome", "ceremony", "reception", "brunch"] as EventId[],
    guestCount: 1,
    dietary: "",
    song: "",
    airport: "",
    arrivalDate: "",
    arrivalTime: "",
    departureDate: "",
    departureTime: "",
    stay: "" as StayArea | "",
    inviteId: "",
    partyAttending: [] as string[],
  });

  const stepKeys = [
    "find",
    "attending",
    ...(allowedEvents.length ? (["events"] as const) : []),
    "party",
    "dietary",
    "song",
    ...(showTravel ? (["travel"] as const) : []),
    "confirm",
  ];
  const currentKey = stepKeys[step] ?? "confirm";

  function eventLabel(event: EventId) {
    return t(`event.${event}`);
  }

  function stayLabel(area: StayArea) {
    return t(`stay.${area}`);
  }

  function selectInvite(record: InviteRecord) {
    const household = householdNames(record);
    setInvite(record);
    setForm((prev) => ({
      ...prev,
      name: `${record.firstName} ${record.lastName}`,
      email: record.email,
      events: eventsForInvite(record),
      guestCount: household.length,
      inviteId: record.id,
      partyAttending: household,
    }));
    setStep(1);
  }

  function next() {
    if (step === 1 && !form.attending) {
      submitRsvp({ ...form, events: [], guestCount: 0, partyAttending: [] });
      setDone(true);
      return;
    }
    if (step >= stepKeys.length - 1) {
      submitRsvp({
        ...form,
        guestCount: form.partyAttending.length || form.guestCount,
      });
      setDone(true);
      return;
    }
    setStep((value) => value + 1);
  }

  if (done) {
    return (
      <main className="pt-24 md:pt-28">
        <SectionWrap className="bg-ivory">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-sage/20 font-serif text-4xl text-forest">
              ✓
            </div>
            <p className="font-script text-2xl italic text-taupe">Grazie</p>
            <h1 className="mt-3 font-serif text-4xl font-light tracking-[0.1em] uppercase">
              {form.attending ? t("rsvp.seeYou") : t("rsvp.missYou")}
            </h1>
            <p className="mt-5 font-sans text-charcoal/70">
              {form.attending
                ? `${form.partyAttending.join(", ") || form.name} · ${form.events.map((event) => eventLabel(event)).join(", ")}`
                : t("rsvp.thanksKnow")}
            </p>
            <div className="mt-10 flex justify-center">
              <Link href="/" className="btn-primary">
                {t("rsvp.backHome")}
              </Link>
            </div>
          </div>
        </SectionWrap>
      </main>
    );
  }

  const label = t(`rsvp.step.${currentKey}`);

  return (
    <main className="pt-24 md:pt-28">
      <SectionWrap className="bg-ivory">
        <PageHeader eyebrow="Kindly reply" title="RSVP" description="Find your invitation — we'll fill in your party from our list." editId="rsvp" />
        <div className="mx-auto mt-10 flex max-w-xl justify-between gap-1">
          {stepKeys.map((item, index) => (
            <div key={item} className={`h-1 flex-1 rounded-full ${index <= step ? "bg-forest" : "bg-beige"}`} />
          ))}
        </div>
        <p className="mt-4 text-center label-caps">
          {t("rsvp.stepLabel", { n: step + 1, label })}
        </p>

        <div className="mx-auto mt-10 max-w-md">
          {step === 0 ? (
            <div>
              <label className="block">
                <span className="label-caps">{t("rsvp.yourName")}</span>
                <input
                  className="input-line"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("rsvp.namePlaceholder")}
                />
              </label>
              <div className="mt-4 space-y-2">
                {matches.map((record) => (
                  <button
                    key={record.id}
                    type="button"
                    className="w-full rounded-2xl border border-taupe/20 px-4 py-4 text-left hover:border-forest"
                    onClick={() => selectInvite(record)}
                  >
                    <p className="font-serif text-xl">
                      {record.firstName} {record.lastName}
                    </p>
                    <p className="mt-1 font-sans text-sm text-charcoal/65">
                      {record.location}
                      {record.inItaly ? ` · ${t("rsvp.italyGuest")}` : ` · ${t("rsvp.travelingIn")}`}
                      {record.party.length ? ` · ${t("rsvp.partyOf", { n: record.party.length + 1 })}` : ""}
                    </p>
                    {record.party.length ? (
                      <p className="mt-1 font-sans text-xs text-taupe">{t("rsvp.with", { names: record.party.join(", ") })}</p>
                    ) : null}
                  </button>
                ))}
              </div>
              {query.length >= 2 && matches.length === 0 ? (
                <p className="mt-4 font-sans text-sm text-taupe">
                  {t("rsvp.noMatch")}
                </p>
              ) : null}
              <button
                type="button"
                className="btn-secondary mt-6"
                disabled={query.trim().split(" ").length < 2}
                onClick={() => {
                  const [first, ...rest] = query.trim().split(" ");
                  selectInvite({
                    id: `new-${Date.now()}`,
                    firstName: first,
                    lastName: rest.join(" "),
                    email: "",
                    location: "",
                    inItaly: false,
                    party: [],
                    events: ["welcome", "ceremony", "reception", "brunch"],
                    tags: [...DEFAULT_GUEST_TAGS],
                  });
                }}
              >
                {t("rsvp.continueWithout")}
              </button>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-4">
              <p className="text-center font-sans text-sm text-charcoal/70">
                {invite?.inItaly ? t("rsvp.italyGuestLine", { name: form.name }) : form.name}
              </p>
              {[true, false].map((value) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => setForm({ ...form, attending: value })}
                  className={`rounded-2xl border px-6 py-6 font-serif text-2xl uppercase ${
                    form.attending === value ? "border-forest bg-forest text-ivory" : "border-taupe/20"
                  }`}
                >
                  {value ? t("rsvp.yes") : t("rsvp.no")}
                </button>
              ))}
            </div>
          ) : null}

          {currentKey === "events" ? (
            <div className="space-y-3">
              {allowedEvents.map((event) => {
                const on = form.events.includes(event);
                return (
                  <button
                    key={event}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        events: on ? form.events.filter((item) => item !== event) : [...form.events, event],
                      })
                    }
                    className={`w-full rounded-2xl border px-5 py-4 text-left ${on ? "border-forest bg-sage/15" : "border-taupe/20"}`}
                  >
                    {eventLabel(event)}
                  </button>
                );
              })}
            </div>
          ) : null}

          {currentKey === "party" ? (
            <div className="space-y-3">
              <p className="font-sans text-sm text-charcoal/70">{t("rsvp.whoComing")}</p>
              {names.map((name) => {
                const on = form.partyAttending.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        partyAttending: on
                          ? form.partyAttending.filter((item) => item !== name)
                          : [...form.partyAttending, name],
                      })
                    }
                    className={`w-full rounded-2xl border px-5 py-4 text-left ${on ? "border-forest bg-sage/15" : "border-taupe/20"}`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          ) : null}

          {currentKey === "dietary" ? (
            <label className="block">
              <span className="label-caps">{t("rsvp.dietary")}</span>
              <input className="input-line" value={form.dietary} onChange={(e) => setForm({ ...form, dietary: e.target.value })} placeholder={t("rsvp.dietaryPh")} />
            </label>
          ) : null}

          {currentKey === "song" ? (
            <label className="block">
              <span className="label-caps">{t("rsvp.song")}</span>
              <input className="input-line" value={form.song} onChange={(e) => setForm({ ...form, song: e.target.value })} placeholder={t("rsvp.songPh")} />
            </label>
          ) : null}

          {currentKey === "travel" ? (
            <div className="space-y-6">
              <p className="font-sans text-sm text-charcoal/70">
                {t("rsvp.travelHelp")}
              </p>
              <label className="block">
                <span className="label-caps">{t("rsvp.arrivalAirport")}</span>
                <input className="input-line" value={form.airport} onChange={(e) => setForm({ ...form, airport: e.target.value })} placeholder="NAP or FCO" />
              </label>
              <div className="grid gap-6 sm:grid-cols-2">
                <label>
                  <span className="label-caps">{t("rsvp.arrivalDate")}</span>
                  <input type="date" className="input-line" value={form.arrivalDate} onChange={(e) => setForm({ ...form, arrivalDate: e.target.value })} />
                </label>
                <label>
                  <span className="label-caps">{t("rsvp.arrivalTime")}</span>
                  <input type="time" className="input-line" value={form.arrivalTime} onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })} />
                </label>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <label>
                  <span className="label-caps">{t("rsvp.departureDate")}</span>
                  <input type="date" className="input-line" value={form.departureDate} onChange={(e) => setForm({ ...form, departureDate: e.target.value })} />
                </label>
                <label>
                  <span className="label-caps">{t("rsvp.departureTime")}</span>
                  <input type="time" className="input-line" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} />
                </label>
              </div>
              <label className="block">
                <span className="label-caps">{t("rsvp.stay")}</span>
                <select className="input-line" value={form.stay} onChange={(e) => setForm({ ...form, stay: e.target.value as StayArea | "" })}>
                  <option value="">{t("rsvp.preferNot")}</option>
                  {(Object.keys(STAY_LABELS) as StayArea[]).map((area) => (
                    <option key={area} value={area}>{stayLabel(area)}</option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          {currentKey === "confirm" ? (
            <dl className="space-y-3 font-sans text-sm text-charcoal/80">
              <div className="flex justify-between"><dt>{t("rsvp.name")}</dt><dd>{form.name}</dd></div>
              <div className="flex justify-between"><dt>{t("rsvp.attending")}</dt><dd>{form.attending ? t("rsvp.yes") : t("rsvp.no")}</dd></div>
              <div className="flex justify-between gap-6"><dt>{t("rsvp.party")}</dt><dd className="text-right">{form.partyAttending.join(", ") || form.name}</dd></div>
              <div className="flex justify-between gap-6"><dt>{t("rsvp.events")}</dt><dd className="text-right">{form.events.map((e) => eventLabel(e)).join(", ")}</dd></div>
              {showTravel && form.arrivalDate ? (
                <div className="flex justify-between gap-6">
                  <dt>{t("rsvp.arrival")}</dt>
                  <dd className="text-right">
                    {[formatDate(form.arrivalDate, locale), form.arrivalTime ? formatTime(form.arrivalTime, locale) : "", form.airport]
                      .filter(Boolean)
                      .join(" ")}
                  </dd>
                </div>
              ) : null}
              {showTravel && form.departureDate ? (
                <div className="flex justify-between gap-6">
                  <dt>{t("rsvp.departure")}</dt>
                  <dd className="text-right">
                    {[formatDate(form.departureDate, locale), form.departureTime ? formatTime(form.departureTime, locale) : ""]
                      .filter(Boolean)
                      .join(" ")}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          {step > 0 ? (
            <div className="mt-10 flex justify-between">
              <button type="button" className="btn-secondary" onClick={() => setStep((value) => Math.max(0, value - 1))}>
                {t("rsvp.back")}
              </button>
              <button type="button" className="btn-primary" onClick={next}>
                {step >= stepKeys.length - 1 ? t("rsvp.submit") : t("rsvp.continue")}
              </button>
            </div>
          ) : null}
        </div>
      </SectionWrap>
    </main>
  );
}
