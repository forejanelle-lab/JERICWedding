"use client";

import { useMemo, useState } from "react";
import { Lightbox } from "@/components/site/Interactive";
import { EditText } from "@/components/site/EditText";
import { GuestPhotoCard, PhotoFolders } from "@/components/site/PhotoFolders";
import { PhotoTile } from "@/components/site/PhotoTile";
import { PhotoUpload } from "@/components/site/PhotoUpload";
import { visibleGuestPhotos } from "@/lib/hub/albums";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const OURS = [
  { src: "/images/couple-hero.jpg", caption: "Janelle & Eric" },
  { src: "/images/couple-proposal.jpg", caption: "Engagement" },
  { src: "/images/couple-story.jpg", caption: "A walk" },
  { src: "/images/casale-bosco.jpg", caption: "The estate" },
];

export default function PhotosPage() {
  const { state } = useHub();
  const { t } = useI18n();
  const [oursIndex, setOursIndex] = useState<number | null>(null);
  const [wallIndex, setWallIndex] = useState<number | null>(null);
  const frames = useMemo(
    () =>
      OURS.map((image, index) => ({
        id: `photos.ours.${index}`,
        src: state.siteImages[`photos.ours.${index}`] ?? image.src,
        caption: state.siteCopy[`photos.ours.${index}.caption`] ?? image.caption,
        hidden: state.siteHidden.includes(`photos.ours.${index}`),
      })),
    [state.siteCopy, state.siteHidden, state.siteImages],
  );
  const visibleOurs = frames.filter((frame) => !frame.hidden);
  const photos = visibleGuestPhotos(state);
  const wallImages = useMemo(() => photos.map((photo) => ({ src: photo.src, caption: photo.caption })), [photos]);
  const oursImages = useMemo(
    () => visibleOurs.map((frame) => ({ src: frame.src, caption: frame.caption })),
    [visibleOurs],
  );

  return (
    <main className="pt-[calc(4.75rem+env(safe-area-inset-top))] md:pt-20">
      <section className="px-5 py-10 md:px-10 md:py-12 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <EditText id="photos.eyebrow" as="p" className="font-script text-xl italic text-taupe">
            Ours, then yours
          </EditText>
          <EditText id="photos.title" as="h1" className="mt-2 font-serif text-4xl font-light tracking-[0.1em] uppercase md:text-5xl">
            Photos
          </EditText>
          <EditText id="photos.intro" as="p" multiline className="mt-3 max-w-lg font-sans text-sm leading-relaxed text-charcoal/70">
            A handful of our favorite frames — and a wall for the ones you take.
          </EditText>

          <PhotoFolders />

          <div id="upload" className="mt-8 border-t border-taupe/15 pt-6">
            <EditText id="photos.add" as="p" className="mb-4 font-sans text-[0.58rem] uppercase tracking-[0.22em] text-taupe">
              Add yours
            </EditText>
            <PhotoUpload />
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {OURS.map((image, i) => (
              <PhotoTile
                key={image.src}
                id={`photos.ours.${i}`}
                src={image.src}
                caption={image.caption}
                onOpen={() => {
                  const index = visibleOurs.findIndex((frame) => frame.id === `photos.ours.${i}`);
                  if (index >= 0) setOursIndex(index);
                }}
              />
            ))}
          </div>

          <div className="mt-10">
            <EditText id="photos.wall" as="h2" className="mb-4 font-serif text-xl font-light tracking-[0.1em] uppercase">
              Guest wall
            </EditText>
            {photos.length === 0 ? (
              <p className="font-sans text-sm text-charcoal/55">{t("photos.empty")}</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {photos.map((photo, index) => (
                  <GuestPhotoCard key={photo.id} photo={photo} onOpen={() => setWallIndex(index)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Lightbox
        images={oursImages}
        index={oursIndex}
        onClose={() => setOursIndex(null)}
        onPrev={() => setOursIndex((value) => (value === null ? 0 : (value + oursImages.length - 1) % oursImages.length))}
        onNext={() => setOursIndex((value) => (value === null ? 0 : (value + 1) % oursImages.length))}
      />
      <Lightbox
        images={wallImages}
        index={wallIndex}
        onClose={() => setWallIndex(null)}
        onPrev={() => setWallIndex((value) => (value === null ? 0 : (value + photos.length - 1) % photos.length))}
        onNext={() => setWallIndex((value) => (value === null ? 0 : (value + 1) % photos.length))}
      />
    </main>
  );
}
