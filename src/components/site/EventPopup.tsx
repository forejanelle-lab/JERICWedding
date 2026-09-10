"use client";

import { useEffect } from "react";
import { AddToCalendar } from "@/components/site/Interactive";
import { EditText } from "@/components/site/EditText";
import { useHub } from "@/lib/hub/store";
import { mapsUrl } from "@/lib/hub/utils";
import { isWeekendEventHidden, weekendEventHideId } from "@/lib/hub/access";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { WeekendEvent } from "@/lib/hub/types";

export function EventPopup({ event, onClose }: { event: WeekendEvent; onClose: () => void }) {
  const { state, hideSiteItem } = useHub();
  const { t } = useI18n();

  useEffect(() => {
    const onKey = (keyboard: KeyboardEvent) => {
      if (keyboard.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-[#242424]/50" aria-label={t("ui.close")} onClick={onClose} />
      <article className="relative z-[1] mb-[env(safe-area-inset-bottom)] max-h-[88svh] w-full max-w-lg overflow-y-auto rounded-t-[24px] bg-ivory p-5 shadow-[0_24px_60px_rgba(36,36,36,0.25)] sm:mb-0 sm:rounded-[24px] md:p-8">
        <button
          type="button"
          className="absolute right-3 top-3 min-h-11 min-w-11 font-sans text-sm uppercase tracking-[0.12em] text-taupe md:right-4 md:top-4 md:text-[0.55rem] md:tracking-[0.16em]"
          onClick={onClose}
        >
          {t("ui.close")}
        </button>
        <EditText id={`weekend.${event.id}.detail.meta`} as="p" className="label-caps text-olive">
          {`${event.day} · ${event.date}`}
        </EditText>
        <EditText id={`weekend.${event.id}.detail.title`} as="h2" className="mt-3 pr-12 font-serif text-3xl font-light tracking-[0.08em] uppercase">
          {event.title}
        </EditText>
        {state.adminAuthed ? (
          <p className="mt-3 font-sans text-xs text-taupe">
            {state.siteEditing
              ? "Tap a line to edit time, dress, notes, and the rest. Save from the bottom bar."
              : "Tap Edit in the bottom bar to change these details."}
          </p>
        ) : null}
        <dl className="mt-6 space-y-4 font-sans text-sm">
          <div>
            <dt className="label-caps">{t("event.time")}</dt>
            <EditText id={`weekend.${event.id}.time`} as="dd" className="mt-1 text-charcoal/80">
              {`${event.time} – ${event.endTime}`}
            </EditText>
          </div>
          <div>
            <dt className="label-caps">{t("event.location")}</dt>
            <EditText id={`weekend.${event.id}.location`} as="dd" className="mt-1 text-charcoal/80">
              {event.location}
            </EditText>
          </div>
          <div>
            <dt className="label-caps">{t("event.address")}</dt>
            <EditText id={`weekend.${event.id}.address`} as="dd" className="mt-1 text-charcoal/80">
              {event.address}
            </EditText>
          </div>
          <div>
            <dt className="label-caps">{t("event.dress")}</dt>
            <EditText id={`weekend.${event.id}.dress`} as="dd" className="mt-1 text-charcoal/80">
              {event.dress}
            </EditText>
          </div>
          <div>
            <dt className="label-caps">{t("event.transport")}</dt>
            <EditText id={`weekend.${event.id}.transport`} as="dd" multiline className="mt-1 text-charcoal/80">
              {event.transport}
            </EditText>
          </div>
          <div>
            <dt className="label-caps">{t("event.notes")}</dt>
            <EditText id={`weekend.${event.id}.notes`} as="dd" multiline className="mt-1 leading-relaxed text-charcoal/80">
              {event.notes}
            </EditText>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-3">
          <AddToCalendar event={event} />
          <a href={mapsUrl(event.mapQuery)} target="_blank" rel="noreferrer" className="btn-secondary">
            {t("ui.openMap")}
          </a>
          {state.adminAuthed && !isWeekendEventHidden(state, event.id) ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                hideSiteItem(weekendEventHideId(event.id));
                onClose();
              }}
            >
              {t("ui.delete")}
            </button>
          ) : null}
        </div>
      </article>
    </div>
  );
}
