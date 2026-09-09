"use client";

import { useState } from "react";
import { FilterPills } from "@/components/site/Interactive";
import { EditImage } from "@/components/site/EditImage";
import { EditText } from "@/components/site/EditText";
import { PageHeader, SectionWrap } from "@/components/site/PageHeader";
import { PLACE_CATEGORIES, PLACES } from "@/lib/hub/content";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { mapsUrl } from "@/lib/hub/utils";
import type { PlaceCategory } from "@/lib/hub/types";

export default function ThingsToDoPage() {
  const { state, savePlace } = useHub();
  const { t } = useI18n();
  const [cat, setCat] = useState<PlaceCategory | "all">("all");
  const places = PLACES.filter((place) => cat === "all" || place.category === cat);

  return (
    <main className="pt-24 md:pt-28">
      <SectionWrap className="bg-ivory !py-12 md:!py-16">
        <PageHeader
          editId="todo"
          eyebrow="A short list"
          title="Things to do"
          description="Save a few. Skip the rest."
        />
        {state.savedPlaces.length ? (
          <p className="mt-4 text-center font-sans text-sm text-olive">{t("todo.nSaved", { n: state.savedPlaces.length })}</p>
        ) : null}
        <div className="mt-8">
          <FilterPills
            value={cat}
            onChange={setCat}
            options={PLACE_CATEGORIES.map((item) => ({ ...item, label: t(`place.${item.id}`) }))}
          />
        </div>
        <ul className="mx-auto mt-8 max-w-3xl divide-y divide-taupe/15 rounded-2xl border border-taupe/15 bg-cream">
          {places.map((place) => {
            const saved = state.savedPlaces.includes(place.id);
            return (
              <li key={place.id} className="flex gap-4 p-4">
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
                  <EditImage id={`todo.${place.id}.image`} src={place.image} alt="" fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <EditText id={`todo.${place.id}.name`} as="h2" className="font-serif text-lg leading-tight">
                      {place.name}
                    </EditText>
                    <EditText id={`todo.${place.id}.distance`} as="p" className="shrink-0 font-sans text-[0.6rem] uppercase tracking-[0.14em] text-taupe">
                      {place.distance}
                    </EditText>
                  </div>
                  <EditText id={`todo.${place.id}.description`} as="p" multiline className="mt-1 line-clamp-2 font-sans text-sm text-charcoal/65">
                    {place.description}
                  </EditText>
                  <div className="mt-2 flex gap-3">
                    <button type="button" className="font-sans text-[0.6rem] uppercase tracking-[0.16em] text-olive" onClick={() => savePlace(place.id)}>
                      {saved ? t("todo.saved") : t("todo.save")}
                    </button>
                    <a href={mapsUrl(place.mapQuery)} target="_blank" rel="noreferrer" className="font-sans text-[0.6rem] uppercase tracking-[0.16em] text-taupe">
                      {t("ui.map")}
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </SectionWrap>
    </main>
  );
}
