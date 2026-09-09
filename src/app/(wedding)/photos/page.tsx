"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FilterPills, Lightbox } from "@/components/site/Interactive";
import { EditText } from "@/components/site/EditText";
import { PhotoTile } from "@/components/site/PhotoTile";
import { PhotoUpload } from "@/components/site/PhotoUpload";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { PhotoAlbum } from "@/lib/hub/types";

const OURS = [
  { src: "/images/couple-hero.jpg", caption: "Janelle & Eric" },
  { src: "/images/couple-proposal.jpg", caption: "Engagement" },
  { src: "/images/couple-story.jpg", caption: "A walk" },
  { src: "/images/casale-bosco.jpg", caption: "The estate" },
];

const ALBUMS: { id: PhotoAlbum | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "friday", label: "Saturday" },
  { id: "wedding", label: "Wedding" },
  { id: "sunday", label: "Monday" },
  { id: "travel", label: "Travel" },
];

export default function PhotosPage() {
  const { state, deletePhoto, updatePhotoCaption } = useHub();
  const { t } = useI18n();
  const [album, setAlbum] = useState<PhotoAlbum | "all">("all");
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
  const photos = state.photos.filter((photo) => photo.approved && (album === "all" || photo.album === album));
  const wallImages = useMemo(() => photos.map((photo) => ({ src: photo.src, caption: photo.caption })), [photos]);
  const oursImages = useMemo(
    () => visibleOurs.map((frame) => ({ src: frame.src, caption: frame.caption })),
    [visibleOurs],
  );

  return (
    <main className="pt-20 md:pt-24">
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
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <EditText id="photos.wall" as="h2" className="font-serif text-xl font-light tracking-[0.1em] uppercase">
                Guest wall
              </EditText>
              <FilterPills
                value={album}
                onChange={setAlbum}
                options={ALBUMS.map((item) => ({
                  ...item,
                  label:
                    item.id === "all"
                      ? t("photos.all")
                      : item.id === "friday"
                        ? t("photos.saturday")
                        : item.id === "wedding"
                          ? t("photos.wedding")
                          : item.id === "sunday"
                            ? t("photos.monday")
                            : t("photos.travel"),
                }))}
              />
            </div>
            {photos.length === 0 ? (
              <p className="font-sans text-sm text-charcoal/55">{t("photos.empty")}</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {photos.slice(0, 15).map((photo, index) => {
                  const canDelete = state.adminAuthed || state.identity?.guestId === photo.authorId;
                  return (
                    <figure key={photo.id} className="min-w-0">
                      <button
                        type="button"
                        className="relative aspect-square w-full overflow-hidden rounded-lg"
                        onClick={() => setWallIndex(index)}
                      >
                        {photo.src.startsWith("data:") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photo.src} alt={photo.caption} className="h-full w-full object-cover" />
                        ) : (
                          <Image src={photo.src} alt={photo.caption} fill className="object-cover" sizes="160px" />
                        )}
                        {canDelete ? (
                          <span
                            className="absolute bottom-2 right-2 z-[2] rounded-full bg-[#242424]/80 px-3 py-1.5 font-sans text-[0.52rem] uppercase tracking-[0.16em] text-[#F9F7F2]"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              deletePhoto(photo.id);
                            }}
                          >
                            {t("photos.delete")}
                          </span>
                        ) : null}
                      </button>
                      {canDelete ? (
                        <input
                          className="mt-1.5 w-full border-0 bg-transparent font-sans text-[0.7rem] text-charcoal/65 outline-none"
                          defaultValue={photo.caption}
                          onBlur={(event) => {
                            const next = event.target.value.trim();
                            if (next !== photo.caption) updatePhotoCaption(photo.id, next);
                          }}
                          placeholder={t("photos.caption")}
                        />
                      ) : photo.caption ? (
                        <p className="mt-1.5 font-sans text-[0.7rem] text-charcoal/65">{photo.caption}</p>
                      ) : null}
                    </figure>
                  );
                })}
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
