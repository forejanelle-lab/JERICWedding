"use client";

import { useEffect, useState } from "react";
import { EditText } from "@/components/site/EditText";
import { EventPopup } from "@/components/site/EventPopup";
import { PageHeader, SectionWrap } from "@/components/site/PageHeader";
import { canEditWebsite, canSeeEvent, isWeekendEventHidden, weekendEventHideId } from "@/lib/hub/access";
import { WEEKEND_EVENTS } from "@/lib/hub/content";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function WeekendPage() {
  const { state, hideSiteItem, showSiteItem } = useHub();
  const { t } = useI18n();
  const admin = canEditWebsite(state);
  const events = WEEKEND_EVENTS.filter((event) => {
    if (!canSeeEvent(state, event.id)) return false;
    return admin || !isWeekendEventHidden(state, event.id);
  });
  const [openId, setOpenId] = useState<string | null>(null);
  const open = events.find((event) => event.id === openId && !isWeekendEventHidden(state, event.id)) ?? null;

  useEffect(() => {
    if (openId && !events.some((event) => event.id === openId && !isWeekendEventHidden(state, event.id))) {
      setOpenId(null);
    }
  }, [events, openId, state.siteHidden]);

  return (
    <main className="pt-[calc(4.75rem+env(safe-area-inset-top))] md:pt-[3.4rem]">
      <SectionWrap className="bg-ivory !py-8 md:!py-10">
        <PageHeader
          compact
          editId="weekend"
          eyebrow="Casale dei Mascioni"
          title="The Weekend"
          description="Tap any event you're invited to for time, dress, and more."
        />

        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {events.length === 0 ? (
            <p className="text-center font-sans text-sm text-charcoal/70">
              {t("weekend.empty")}
            </p>
          ) : null}
          {(["Saturday", "Sunday", "Monday"] as const).map((day) => {
            const dayEvents = events.filter((event) => event.day === day);
            if (!dayEvents.length) return null;
            return (
              <div key={day}>
                <p className="mb-2 mt-6 label-caps first:mt-0">{t(`day.${day}`)}</p>
                {dayEvents.map((event) => {
                  const hidden = isWeekendEventHidden(state, event.id);
                  return (
                    <div
                      key={event.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (!hidden) setOpenId(event.id);
                      }}
                      onKeyDown={(keyboard) => {
                        if (hidden) return;
                        if (keyboard.key === "Enter" || keyboard.key === " ") {
                          keyboard.preventDefault();
                          setOpenId(event.id);
                        }
                      }}
                      className={`relative mb-2 min-h-[4.75rem] w-full rounded-2xl border bg-ivory px-4 py-4 text-left transition-all ${
                        hidden
                          ? "cursor-default border-taupe/20 opacity-55"
                          : "cursor-pointer border-taupe/15 hover:-translate-y-0.5 hover:border-forest/30 hover:shadow-[0_12px_30px_rgba(47,58,46,0.06)]"
                      }`}
                    >
                      {admin ? (
                        <button
                          type="button"
                          className="absolute right-3 top-3 z-[2] rounded-full bg-[#2D3B2D] px-3 py-1.5 font-sans text-[0.52rem] uppercase tracking-[0.16em] text-[#F9F7F2]"
                          onClick={(click) => {
                            click.preventDefault();
                            click.stopPropagation();
                            const id = weekendEventHideId(event.id);
                            if (hidden) showSiteItem(id);
                            else hideSiteItem(id);
                          }}
                        >
                          {hidden ? t("ui.restore") : t("ui.delete")}
                        </button>
                      ) : null}
                      <EditText
                        id={`weekend.${event.id}.title`}
                        as="p"
                        className={`font-serif text-xl tracking-[0.06em] uppercase ${admin ? "pr-20" : ""}`}
                      >
                        {event.title}
                      </EditText>
                      <div className="mt-1 font-sans text-sm text-charcoal/60">
                        <EditText id={`weekend.${event.id}.when`} as="span">
                          {`${event.time} · ${event.location}`}
                        </EditText>
                      </div>
                      <p className="mt-2 font-sans text-[0.55rem] uppercase tracking-[0.16em] text-olive">
                        {hidden ? t("ui.restore") : t("ui.moreInfo")}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </SectionWrap>

      {open ? <EventPopup event={open} onClose={() => setOpenId(null)} /> : null}
    </main>
  );
}
