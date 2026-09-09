"use client";

import { useEffect, useState } from "react";
import { downloadIcs } from "@/lib/hub/utils";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { WeekendEvent } from "@/lib/hub/types";

export function AddToCalendar({ event }: { event: WeekendEvent }) {
  const { t } = useI18n();
  return (
    <button type="button" onClick={() => downloadIcs(event)} className="btn-secondary">
      {t("ui.addToCalendar")}
    </button>
  );
}

export function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: { src: string; caption?: string }[];
  index: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { t } = useI18n();
  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, onClose, onPrev, onNext]);

  if (index === null) return null;
  const image = images[index];
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-charcoal/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t("ui.photo")}
    >
      <button
        type="button"
        className="absolute right-5 top-5 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-ivory/70"
        onClick={onClose}
      >
        {t("ui.close")}
      </button>
      <button
        type="button"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-ivory/80"
        onClick={(event) => {
          event.stopPropagation();
          onPrev();
        }}
        aria-label={t("ui.previous")}
      >
        ‹
      </button>
      <figure
        className="max-h-[85vh] max-w-4xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} alt={image.caption ?? ""} className="max-h-[78vh] w-full object-contain" />
        {image.caption ? (
          <figcaption className="mt-4 text-center font-sans text-sm text-ivory/70">
            {image.caption}
          </figcaption>
        ) : null}
      </figure>
      <button
        type="button"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-ivory/80"
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
        aria-label={t("ui.next")}
      >
        ›
      </button>
    </div>
  );
}

export function FilterPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`rounded-full border px-4 py-2 font-sans text-[0.6rem] uppercase tracking-[0.18em] transition-colors ${
            value === option.id
              ? "border-forest bg-forest text-ivory"
              : "border-taupe/25 text-charcoal/70 hover:border-charcoal/40"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const { t } = useI18n();
  const tone =
    status === "open"
      ? "bg-sage/15 text-olive"
      : status === "full"
        ? "bg-taupe/15 text-taupe"
        : status === "confirmed"
          ? "bg-forest/10 text-forest"
          : "bg-gold/15 text-gold";
  return (
    <span className={`rounded-full px-3 py-1 font-sans text-[0.55rem] uppercase tracking-[0.2em] ${tone}`}>
      {t(`status.${status}`)}
    </span>
  );
}

export function useTick(value: number) {
  const [key, setKey] = useState(value);
  useEffect(() => setKey(value), [value]);
  return key;
}
