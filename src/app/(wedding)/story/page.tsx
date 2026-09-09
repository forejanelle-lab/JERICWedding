"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Lightbox } from "@/components/site/Interactive";
import { EditImage } from "@/components/site/EditImage";
import { EditText } from "@/components/site/EditText";
import { PhotoTile } from "@/components/site/PhotoTile";
import { STORY_BEATS } from "@/lib/hub/content";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const PHOTOS = [
  { src: "/images/couple-hero.jpg", caption: "Together" },
  { src: "/images/couple-proposal.jpg", caption: "The yes" },
  { src: "/images/couple-story.jpg", caption: "Golden hour" },
  { src: "/images/casale-bosco.jpg", caption: "The estate" },
];

export default function StoryPage() {
  const { state } = useHub();
  const { t } = useI18n();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const frames = useMemo(
    () =>
      PHOTOS.map((image, index) => ({
        id: `story.frame.${index}`,
        src: state.siteImages[`story.frame.${index}`] ?? image.src,
        caption: state.siteCopy[`story.frame.${index}.caption`] ?? image.caption,
        hidden: state.siteHidden.includes(`story.frame.${index}`),
      })),
    [state.siteCopy, state.siteHidden, state.siteImages],
  );
  const visible = frames.filter((frame) => !frame.hidden);
  const images = visible.map((frame) => ({ src: frame.src, caption: frame.caption }));

  return (
    <main className="px-4 pt-[calc(4.75rem+env(safe-area-inset-top))] pb-8 md:px-10 md:pt-[4.5rem] md:pb-12 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <EditText id="story.eyebrow" as="p" className="font-script text-lg italic text-taupe">
              A love story, briefly
            </EditText>
            <EditText id="story.title" as="h1" className="font-serif text-3xl font-light tracking-[0.08em] uppercase md:text-4xl">
              Our Story
            </EditText>
          </div>
          <Link href="/play/know-us" className="pb-1 font-sans text-[0.58rem] uppercase tracking-[0.18em] text-olive">
            {t("story.knowUs")}
          </Link>
        </div>
        <EditText id="story.intro" as="p" multiline className="mt-2 max-w-xl font-sans text-sm leading-snug text-charcoal/70">
          Salsa in Brooklyn, Campania at first sight, a cliffside yes — then back here, with you.
        </EditText>

        <ol className="mt-5 divide-y divide-taupe/15 border-y border-taupe/15">
          {STORY_BEATS.map((beat) => (
            <li key={beat.year} className="grid items-baseline gap-x-5 py-2.5 sm:grid-cols-[4.5rem_1fr]">
              <EditText id={`story.beat.${beat.year}.year`} as="p" className="font-serif text-lg font-light text-olive">
                {beat.year}
              </EditText>
              <div>
                <EditText id={`story.beat.${beat.year}.title`} as="p" className="font-serif text-base tracking-[0.05em] uppercase">
                  {beat.title}
                </EditText>
                <EditText id={`story.beat.${beat.year}.body`} as="p" multiline className="mt-0.5 font-sans text-sm leading-snug text-charcoal/70">
                  {beat.body}
                </EditText>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex gap-4">
          <button
            type="button"
            className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-28"
            onClick={() => {
              const index = visible.findIndex((frame) => frame.id === "story.frame.1");
              if (index >= 0) setLightbox(index);
            }}
          >
            <EditImage id="story.yes.photo" src="/images/couple-proposal.jpg" alt="Engagement" fill className="object-cover" />
          </button>
          <div className="min-w-0 self-center">
            <EditText id="story.yes.kicker" as="p" className="font-sans text-[0.52rem] uppercase tracking-[0.22em] text-taupe">
              Amalfi Coast · 2026
            </EditText>
            <EditText id="story.yes.title" as="h2" className="mt-0.5 font-serif text-xl font-light tracking-[0.08em] uppercase">
              The yes
            </EditText>
            <EditText id="story.yes.body" as="p" multiline className="mt-1 font-sans text-sm leading-snug text-charcoal/70">
              Sunset, limoncello, a jacket pocket doing far too much work. We kept the minutes after — and the ferry we happily missed.
            </EditText>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <EditText id="story.frames" as="h2" className="font-serif text-base font-light tracking-[0.1em] uppercase">
              A few frames
            </EditText>
            <Link href="/photos" className="font-sans text-[0.55rem] uppercase tracking-[0.18em] text-olive">
              All photos
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PHOTOS.map((image, index) => (
              <PhotoTile
                key={image.src}
                id={`story.frame.${index}`}
                src={image.src}
                caption={image.caption}
                onOpen={() => {
                  const visibleIndex = visible.findIndex((frame) => frame.id === `story.frame.${index}`);
                  if (visibleIndex >= 0) setLightbox(visibleIndex);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <Lightbox
        images={images}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onPrev={() => setLightbox((value) => (value === null ? 0 : (value + images.length - 1) % images.length))}
        onNext={() => setLightbox((value) => (value === null ? 0 : (value + 1) % images.length))}
      />
    </main>
  );
}
