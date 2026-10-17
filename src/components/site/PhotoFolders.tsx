"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Lightbox } from "@/components/site/Interactive";
import { EditText } from "@/components/site/EditText";
import {
  photoFolderLabel,
  photosInFolder,
  visibleGuestPhotos,
} from "@/lib/hub/albums";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { GuestPhoto } from "@/lib/hub/types";

function countLabel(count: number, t: (key: string, vars?: Record<string, string | number>) => string) {
  return count === 1 ? t("photos.countOne") : t("photos.count", { n: count });
}

function Cover({ src, alt }: { src?: string; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(165deg,#f7f3eb_0%,#e7e1d6_100%)]">
        <span className="font-serif text-4xl font-light text-olive/40" aria-hidden>
          +
        </span>
      </div>
    );
  }
  if (src.startsWith("data:")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className="h-full w-full object-cover" />;
  }
  return <Image src={src} alt={alt} fill className="object-cover" sizes="160px" />;
}

function FolderFace({ cover, count }: { cover?: string; count: number }) {
  return (
    <div className="relative pt-3">
      <div className="absolute left-0 top-0 h-4 w-14 rounded-t-lg border border-b-0 border-taupe/25 bg-[#e7e1d6]" />
      <div className="relative aspect-[5/4] overflow-hidden rounded-xl rounded-tl-sm border border-taupe/20 bg-cream shadow-[0_10px_24px_rgba(47,58,46,0.06)]">
        <Cover src={cover} alt="" />
        <span className="absolute bottom-2 right-2 rounded-full bg-ivory/90 px-2 py-0.5 font-sans text-[0.55rem] tracking-[0.12em] text-forest">
          {count}
        </span>
      </div>
    </div>
  );
}

export function GuestPhotoCard({ photo, onOpen }: { photo: GuestPhoto; onOpen: () => void }) {
  const { state, deletePhoto, updatePhotoAlbum, updatePhotoCaption } = useHub();
  const { t } = useI18n();
  const canEdit = state.adminAuthed || state.identity?.guestId === photo.authorId;
  const folders = state.photoFolders;
  const current = folders.find((folder) => folder.id === photo.album);
  const tag = current ? photoFolderLabel(current, t) : photo.album;

  return (
    <figure className="min-w-0">
      <div className="relative">
        <button type="button" className="relative aspect-square w-full overflow-hidden rounded-lg" onClick={onOpen}>
          {photo.src.startsWith("data:") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.src} alt={photo.caption || tag} className="h-full w-full object-cover" />
          ) : (
            <Image src={photo.src} alt={photo.caption || tag} fill className="object-cover" sizes="180px" />
          )}
        </button>
        {canEdit ? (
          <button
            type="button"
            className="absolute bottom-2 right-2 z-[2] rounded-full bg-[#242424]/80 px-3 py-1.5 font-sans text-[0.52rem] uppercase tracking-[0.16em] text-[#F9F7F2]"
            onClick={() => deletePhoto(photo.id)}
          >
            {t("photos.delete")}
          </button>
        ) : null}
      </div>
      {canEdit ? (
        <>
          <input
            className="mt-1.5 w-full border-0 bg-transparent font-sans text-[0.7rem] text-charcoal/65 outline-none"
            defaultValue={photo.caption}
            key={`${photo.id}-caption-${photo.caption}`}
            onBlur={(event) => {
              const next = event.target.value.trim();
              if (next !== photo.caption) updatePhotoCaption(photo.id, next);
            }}
            placeholder={t("photos.caption")}
            aria-label={t("photos.caption")}
          />
          <select
            className="mt-0.5 w-full bg-transparent py-1 font-sans text-[0.68rem] text-olive outline-none"
            value={photo.album}
            aria-label={t("photos.album")}
            onChange={(event) => updatePhotoAlbum(photo.id, event.target.value)}
          >
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {photoFolderLabel(folder, t)}
              </option>
            ))}
            {current ? null : <option value={photo.album}>{photo.album}</option>}
          </select>
        </>
      ) : (
        <>
          {photo.caption ? <p className="mt-1.5 font-sans text-[0.7rem] text-charcoal/65">{photo.caption}</p> : null}
          {tag ? <p className="mt-0.5 font-sans text-[0.58rem] uppercase tracking-[0.14em] text-olive">{tag}</p> : null}
        </>
      )}
    </figure>
  );
}

export function PhotoFolders() {
  const { state, addPhotoFolder, renamePhotoFolder, removePhotoFolder } = useHub();
  const { t } = useI18n();
  const [openId, setOpenId] = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const [managing, setManaging] = useState(false);
  const folders = state.photoFolders;
  const photos = visibleGuestPhotos(state);
  const editing = state.adminAuthed && managing;
  const openFolder = folders.find((folder) => folder.id === openId) ?? null;
  const openPhotos = openFolder ? photosInFolder(photos, openFolder.id) : [];
  const openLabel = openFolder ? photoFolderLabel(openFolder, t) : "";
  const slides = openPhotos.map((photo) => ({ src: photo.src, caption: photo.caption || openLabel }));
  const photoIndexRef = useRef(photoIndex);
  photoIndexRef.current = photoIndex;

  useEffect(() => {
    if (!openFolder) return;
    document.body.dataset.modal = "album";
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && photoIndexRef.current === null) setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      delete document.body.dataset.modal;
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openFolder]);

  return (
    <div className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <EditText id="photos.folders" as="h2" className="font-serif text-xl font-light tracking-[0.1em] uppercase">
          Albums
        </EditText>
        {state.adminAuthed ? (
          <button
            type="button"
            className="font-sans text-[0.58rem] uppercase tracking-[0.16em] text-olive"
            onClick={() => setManaging((value) => !value)}
          >
            {editing ? t("photos.done") : t("photos.editAlbums")}
          </button>
        ) : null}
      </div>
      {editing ? (
        <p className="mb-3 max-w-lg font-sans text-sm text-charcoal/60">{t("photos.editAlbumsHint")}</p>
      ) : null}
      <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2 snap-x snap-mandatory [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
        {folders.map((folder) => {
          const label = photoFolderLabel(folder, t);
          const inFolder = photosInFolder(photos, folder.id);
          return (
            <div key={folder.id} className="w-[7.75rem] shrink-0 snap-start sm:w-[8.75rem]">
              <button
                type="button"
                className="block w-full text-left transition-transform duration-300 hover:-translate-y-1"
                aria-label={`${label}, ${countLabel(inFolder.length, t)}`}
                onClick={() => {
                  setPhotoIndex(null);
                  setOpenId(folder.id);
                }}
              >
                <FolderFace cover={inFolder[0]?.src} count={inFolder.length} />
              </button>
              {editing ? (
                <div className="mt-2 space-y-1">
                  <input
                    className="w-full rounded-md border border-taupe/30 bg-white px-2 py-1 font-sans text-sm text-charcoal"
                    defaultValue={folder.label}
                    key={`${folder.id}-${folder.label}`}
                    aria-label={t("photos.folderPh")}
                    onBlur={(event) => {
                      const next = event.target.value.trim();
                      if (next && next !== folder.label) renamePhotoFolder(folder.id, next);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        event.currentTarget.blur();
                      }
                    }}
                  />
                  {folders.length > 1 ? (
                    <button
                      type="button"
                      className="font-sans text-[0.55rem] uppercase tracking-[0.14em] text-taupe"
                      onClick={() => removePhotoFolder(folder.id)}
                    >
                      {t("photos.removeFolder")}
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="mt-2">
                  <p className="font-serif text-[1.02rem] leading-tight text-charcoal">{label}</p>
                  <p className="mt-0.5 font-sans text-[0.58rem] uppercase tracking-[0.14em] text-taupe">
                    {countLabel(inFolder.length, t)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
        {editing ? (
          <form
            className="w-[7.75rem] shrink-0 snap-start sm:w-[8.75rem]"
            onSubmit={(event) => {
              event.preventDefault();
              const input = event.currentTarget.elements.namedItem("label");
              if (!(input instanceof HTMLInputElement)) return;
              addPhotoFolder(input.value);
              input.value = "";
            }}
          >
            <div className="relative pt-3">
              <div className="absolute left-0 top-0 h-4 w-14 rounded-t-lg border border-b-0 border-dashed border-olive/40" />
              <div className="flex aspect-[5/4] items-center justify-center rounded-xl rounded-tl-sm border border-dashed border-olive/40 bg-cream/60">
                <span className="font-serif text-4xl font-light text-olive/70">+</span>
              </div>
            </div>
            <input
              name="label"
              required
              placeholder={t("photos.folderPh")}
              aria-label={t("photos.folderPh")}
              className="mt-2 w-full rounded-md border border-taupe/30 bg-white px-2 py-1 font-sans text-sm text-charcoal"
            />
            <button type="submit" className="mt-1 font-sans text-[0.55rem] uppercase tracking-[0.14em] text-olive">
              {t("photos.addFolder")}
            </button>
          </form>
        ) : null}
      </div>

      {openFolder ? (
        <div
          className="fixed inset-0 z-[75] flex items-end justify-center bg-charcoal/75 p-3 sm:items-center sm:p-6"
          onClick={() => setOpenId(null)}
          role="dialog"
          aria-modal="true"
          aria-label={openLabel}
        >
          <div
            className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-ivory px-4 py-5 sm:px-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="font-script text-xl italic text-taupe">{t("photos.folders")}</p>
                <h3 className="font-serif text-3xl font-light tracking-[0.08em] uppercase">{openLabel}</h3>
                <p className="mt-1 font-sans text-[0.62rem] uppercase tracking-[0.16em] text-taupe">
                  {countLabel(openPhotos.length, t)}
                </p>
              </div>
              <button
                type="button"
                className="min-h-11 px-2 font-sans text-[0.62rem] uppercase tracking-[0.16em] text-charcoal"
                onClick={() => setOpenId(null)}
                autoFocus
              >
                {t("ui.close")}
              </button>
            </div>
            {openPhotos.length === 0 ? (
              <p className="pb-6 font-sans text-sm text-charcoal/60">{t("photos.emptyAlbum")}</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 pb-4 sm:grid-cols-3">
                {openPhotos.map((photo, index) => (
                  <GuestPhotoCard key={photo.id} photo={photo} onOpen={() => setPhotoIndex(index)} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      <Lightbox
        images={slides}
        index={photoIndex}
        onClose={() => setPhotoIndex(null)}
        onPrev={() => setPhotoIndex((value) => (value === null ? 0 : (value + slides.length - 1) % slides.length))}
        onNext={() => setPhotoIndex((value) => (value === null ? 0 : (value + 1) % slides.length))}
      />
    </div>
  );
}

export function PhotoFolderEditor() {
  const { state, addPhotoFolder, renamePhotoFolder, removePhotoFolder } = useHub();
  const [name, setName] = useState("");
  const folders = state.photoFolders;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-serif text-2xl uppercase">Albums</h2>
        <p className="mt-2 max-w-xl font-sans text-sm text-charcoal/65">
          These folders sit at the top of the photos page. Guests tap one to open that album. They still tag each photo on the guest wall.
        </p>
      </div>
      <ul className="space-y-3">
        {folders.map((folder) => {
          const count = state.photos.filter((photo) => photo.album === folder.id).length;
          return (
            <li key={folder.id} className="soft-card flex flex-wrap items-end gap-3 p-4">
              <label className="min-w-[12rem] flex-1">
                <span className="label-caps">Name</span>
                <input
                  className="input-line"
                  defaultValue={folder.label}
                  key={`${folder.id}-${folder.label}`}
                  onBlur={(event) => {
                    const next = event.target.value.trim();
                    if (next && next !== folder.label) renamePhotoFolder(folder.id, next);
                  }}
                />
              </label>
              <p className="pb-3 font-sans text-xs text-taupe">{count === 1 ? "1 photo" : `${count} photos`}</p>
              <button
                type="button"
                className="btn-secondary mb-1 !px-3 !py-2 disabled:opacity-40"
                disabled={folders.length <= 1}
                onClick={() => removePhotoFolder(folder.id)}
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          addPhotoFolder(name);
          setName("");
        }}
      >
        <label className="min-w-[12rem] flex-1">
          <span className="label-caps">New folder</span>
          <input
            className="input-line"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Rehearsal dinner"
          />
        </label>
        <button type="submit" className="btn-primary mb-1" disabled={!name.trim()}>
          Add folder
        </button>
      </form>
    </section>
  );
}
