"use client";

import { useRef, useState, type RefObject } from "react";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type Tag = "h1" | "h2" | "h3" | "p" | "span" | "li" | "dt" | "dd" | "figcaption";

export function EditText({
  id,
  as: Tag = "span",
  className = "",
  children,
  multiline = false,
}: {
  id: string;
  as?: Tag;
  className?: string;
  children: string;
  multiline?: boolean;
}) {
  const { state, updateSiteCopy } = useHub();
  const { locale, has, t } = useI18n();
  const english = state.siteCopy[id] ?? children;
  const value = !state.siteEditing && locale !== "en" && has(id) ? t(id) : english;
  const admin = state.adminAuthed && state.siteEditing;
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  if (!admin) {
    return <Tag className={className}>{value}</Tag>;
  }

  function save() {
    const next = draft.replace(/\u00a0/g, " ").trim();
    if (next) updateSiteCopy(id, next);
    setOpen(false);
  }

  return (
    <span className="relative z-[3] inline-flex max-w-full flex-col items-start gap-1">
      {open ? (
        <>
          {multiline ? (
            <textarea
              ref={inputRef as RefObject<HTMLTextAreaElement>}
              className="min-h-24 w-full max-w-xl rounded-xl border border-[#2D3B2D]/30 bg-white px-3 py-2 font-sans text-sm text-[#242424]"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          ) : (
            <input
              ref={inputRef as RefObject<HTMLInputElement>}
              className="w-full max-w-xl rounded-xl border border-[#2D3B2D]/30 bg-white px-3 py-2 font-sans text-sm text-[#242424]"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  save();
                }
              }}
            />
          )}
          <span className="flex gap-2">
            <button
              type="button"
              className="rounded-full bg-[#2D3B2D] px-3 py-1 font-sans text-[0.52rem] uppercase tracking-[0.14em] text-[#F9F7F2]"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                save();
              }}
            >
              {t("ui.save")}
            </button>
            <button
              type="button"
              className="rounded-full border border-[#2D3B2D]/20 px-3 py-1 font-sans text-[0.52rem] uppercase tracking-[0.14em] text-[#2D3B2D]"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setDraft(english);
                setOpen(false);
              }}
            >
              {t("ui.cancel")}
            </button>
          </span>
        </>
      ) : (
        <>
          <Tag className={`${className} rounded-sm outline outline-1 outline-dashed outline-[#2D3B2D]/35`}>{value}</Tag>
          <button
            type="button"
            className="rounded-full bg-[#2D3B2D] px-2.5 py-1 font-sans text-[0.5rem] uppercase tracking-[0.14em] text-[#F9F7F2]"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setDraft(english);
              setOpen(true);
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
          >
            {t("ui.edit")}
          </button>
        </>
      )}
    </span>
  );
}
