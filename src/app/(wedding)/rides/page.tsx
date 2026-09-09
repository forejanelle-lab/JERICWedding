"use client";

import { useState } from "react";
import { Avatar } from "@/components/site/Avatar";
import { EditText } from "@/components/site/EditText";
import { FilterPills, StatusPill } from "@/components/site/Interactive";
import { guestById, guestName, useHub } from "@/lib/hub/store";
import { formatDate, formatTime } from "@/lib/hub/utils";
import type { RideKind } from "@/lib/hub/types";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import Link from "next/link";

export default function RidesPage() {
  const { state, me, postRide, updateRide, deleteRide, askForSeat, respondSeat } = useHub();
  const { t, locale } = useI18n();
  const [kind, setKind] = useState<RideKind | "all">("all");
  const [formKind, setFormKind] = useState<RideKind>("offer");
  const [editingId, setEditingId] = useState<string | null>(null);
  const identity = state.identity;
  const editing = state.rides.find((ride) => ride.id === editingId) ?? null;

  const rides = state.rides.filter((ride) => (kind === "all" ? true : ride.kind === kind));

  return (
    <main className="px-4 pt-[calc(4.75rem+env(safe-area-inset-top))] pb-8 md:px-10 md:pt-[4.5rem] md:pb-12 lg:px-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <EditText id="rides.title" as="h1" className="font-serif text-[1.85rem] font-light leading-tight tracking-[0.06em] uppercase md:text-4xl md:tracking-[0.08em]">
            Need a Ride?
          </EditText>
          <EditText id="rides.intro" as="p" className="mt-1 font-sans text-sm text-charcoal/60">
            Offer a seat or request one. At the end of the day we email everyone on the list a short summary. Unsubscribe anytime.
          </EditText>
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-8 md:flex-row md:items-start md:gap-8">
        <aside className="w-full shrink-0 md:sticky md:top-20 md:w-[42%] md:max-w-[22rem]">
          {identity || (state.adminAuthed && editingId) ? (
            <form
              key={editingId ?? "new"}
              className="space-y-2.5"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                const payload = {
                  kind: formKind,
                  from: String(data.get("from")),
                  to: String(data.get("to")),
                  date: String(data.get("date")),
                  time: String(data.get("time")),
                  seats: Number(data.get("seats") || 1),
                  luggage: String(data.get("luggage")),
                  notes: String(data.get("notes")),
                };
                if (editingId) updateRide(editingId, payload);
                else postRide(payload);
                setEditingId(null);
                event.currentTarget.reset();
              }}
            >
              <h2 className="font-serif text-xl font-light tracking-[0.08em] uppercase">
                {editingId ? t("rides.editPost") : t("rides.enterDetails")}
              </h2>
              <div className="flex gap-2">
                {(["offer", "request"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormKind(value)}
                    className={`rounded-full px-3 py-1.5 font-sans text-[0.55rem] uppercase tracking-[0.14em] ${
                      formKind === value ? "bg-forest text-ivory" : "bg-cream"
                    }`}
                  >
                    {value === "offer" ? t("rides.iCanDrive") : t("rides.iNeedSeat")}
                  </button>
                ))}
              </div>
              <label className="block">
                <span className="label-caps">{t("rides.from")}</span>
                <input name="from" required placeholder={t("rides.fromPh")} defaultValue={editing?.from} className="input-line" />
              </label>
              <label className="block">
                <span className="label-caps">{t("rides.to")}</span>
                <input name="to" required placeholder={t("rides.toPh")} defaultValue={editing?.to} className="input-line" />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label>
                  <span className="label-caps">{t("rides.date")}</span>
                  <input name="date" type="date" required defaultValue={editing?.date ?? "2027-09-04"} className="input-line" />
                </label>
                <label>
                  <span className="label-caps">{t("rides.time")}</span>
                  <input name="time" type="time" required defaultValue={editing?.time ?? "15:00"} className="input-line" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label>
                  <span className="label-caps">{formKind === "offer" ? t("rides.seats") : t("rides.need")}</span>
                  <input name="seats" type="number" min={1} max={6} defaultValue={editing?.seats ?? 2} className="input-line" />
                </label>
                <label>
                  <span className="label-caps">{t("rides.luggage")}</span>
                  <input name="luggage" placeholder={t("rides.luggagePh")} defaultValue={editing?.luggage} className="input-line" />
                </label>
              </div>
              <label className="block">
                <span className="label-caps">{t("rides.notes")}</span>
                <input name="notes" placeholder={t("rides.notesPh")} defaultValue={editing?.notes} className="input-line" />
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="submit" className="btn-primary !px-5 !py-2.5">
                  {editingId ? t("rides.saveChanges") : t("rides.publish")}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    className="btn-secondary !px-5 !py-2.5"
                    onClick={() => setEditingId(null)}
                  >
                    {t("ui.cancel")}
                  </button>
                ) : null}
              </div>
              {me ? (
                <p className="font-sans text-xs text-taupe">{t("rides.postedAs", { name: guestName(me) })}</p>
              ) : null}
            </form>
          ) : (
            <div>
              <h2 className="font-serif text-xl font-light tracking-[0.08em] uppercase">{t("rides.enterDetails")}</h2>
              <p className="mt-3 font-sans text-sm leading-relaxed text-charcoal/65">
                {t("rides.joinBody")}
              </p>
              <Link href="/join?next=/rides" className="btn-primary mt-5 !px-5 !py-2.5">
                {t("rides.joinCta")}
              </Link>
            </div>
          )}
        </aside>

        <section className="min-w-0 flex-1">
          <FilterPills
            value={kind}
            onChange={setKind}
            options={[
              { id: "all", label: t("rides.all") },
              { id: "offer", label: t("rides.offering") },
              { id: "request", label: t("rides.needARide") },
            ]}
          />
          <div className="mt-4 space-y-3 md:max-h-[calc(100svh-10rem)] md:overflow-y-auto md:pr-1">
            {rides.length === 0 ? (
              <p className="font-sans text-sm text-charcoal/55">{t("rides.noPostings")}</p>
            ) : (
              rides.map((ride) => {
                const author = guestById(state.guests, ride.authorId);
                const asks = state.seatAsks.filter((ask) => ask.rideId === ride.id);
                const mine = identity?.guestId === ride.authorId;
                const canEdit = mine || state.adminAuthed;
                return (
                  <article key={ride.id} className="rounded-xl border border-taupe/15 bg-ivory px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-3">
                        <Avatar
                          name={author ? `${author.firstName} ${author.lastName}` : t("rides.guest")}
                          hue={author?.avatarHue}
                        />
                        <div className="min-w-0">
                          <p className="label-caps text-olive">
                            {ride.kind === "offer" ? t("rides.offering") : t("rides.needsARide")}
                          </p>
                          <h2 className="mt-0.5 font-serif text-xl text-charcoal">
                            {ride.from} → {ride.to}
                          </h2>
                          <p className="mt-1 font-sans text-sm text-charcoal/65">
                            {formatDate(ride.date, locale)} · {formatTime(ride.time, locale)} · {t("rides.seatsLine", { free: ride.seats - ride.seatsTaken, total: ride.seats })}
                            {ride.luggage ? ` · ${ride.luggage}` : ""}
                          </p>
                          {ride.notes ? (
                            <p className="mt-1 font-sans text-sm text-charcoal/70">{ride.notes}</p>
                          ) : null}
                          <p className="mt-1 font-sans text-xs text-taupe">{author ? guestName(author) : t("rides.guest")}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <StatusPill status={ride.status} />
                        {canEdit ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="font-sans text-[0.55rem] uppercase tracking-[0.14em] text-olive"
                              onClick={() => {
                                setEditingId(ride.id);
                                setFormKind(ride.kind);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              {t("ui.edit")}
                            </button>
                            <button
                              type="button"
                              className="font-sans text-[0.55rem] uppercase tracking-[0.14em] text-taupe"
                              onClick={() => {
                                deleteRide(ride.id);
                                if (editingId === ride.id) setEditingId(null);
                              }}
                            >
                              {t("ui.delete")}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {identity && !mine && ride.kind === "offer" && ride.status !== "full" ? (
                      <SeatForm onSubmit={(seats, note) => askForSeat(ride.id, seats, note)} />
                    ) : null}

                    {mine && asks.length ? (
                      <div className="mt-3 space-y-2 border-t border-taupe/15 pt-3">
                        <p className="label-caps">{t("rides.requests")}</p>
                        {asks.map((ask) => {
                          const from = guestById(state.guests, ask.fromGuestId);
                          return (
                            <div key={ask.id} className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-sans text-sm">
                                {from ? guestName(from) : t("rides.guest")} · {ask.seats} · {t(`status.${ask.status}`)}
                                {ask.note ? ` — ${ask.note}` : ""}
                              </p>
                              {ask.status === "pending" ? (
                                <div className="flex gap-2">
                                  <button type="button" className="btn-primary !px-3 !py-1.5" onClick={() => respondSeat(ask.id, true)}>
                                    {t("rides.confirm")}
                                  </button>
                                  <button type="button" className="btn-secondary !px-3 !py-1.5" onClick={() => respondSeat(ask.id, false)}>
                                    {t("rides.decline")}
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function SeatForm({ onSubmit }: { onSubmit: (seats: number, note: string) => void }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" className="btn-secondary mt-3 !px-4 !py-2" onClick={() => setOpen(true)}>
        {t("rides.requestSeat")}
      </button>
    );
  }
  return (
    <form
      className="mt-3 grid gap-2 sm:grid-cols-[4rem_1fr_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        onSubmit(Number(data.get("seats") || 1), String(data.get("note")));
        setOpen(false);
      }}
    >
      <input name="seats" type="number" min={1} max={4} defaultValue={1} className="input-line" />
      <input name="note" placeholder={t("rides.noteDriver")} className="input-line" />
      <button type="submit" className="btn-primary !px-4 !py-2">
        {t("rides.send")}
      </button>
    </form>
  );
}
