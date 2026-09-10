"use client";

import { useRef } from "react";
import Image from "next/image";
import { canEditWebsite } from "@/lib/hub/access";
import { useHub } from "@/lib/hub/store";
import { readImageAsCompressedDataUrl } from "@/lib/hub/utils";

export function EditImage({
  id,
  src,
  alt,
  fill = false,
  className = "",
  sizes,
  priority = false,
  deletable = true,
}: {
  id: string;
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  deletable?: boolean;
}) {
  const { state, updateSiteImage, hideSiteItem, showSiteItem } = useHub();
  const hidden = state.siteHidden.includes(id);
  const resolved = state.siteImages[id] ?? src;
  const admin = canEditWebsite(state) && state.siteEditing;
  const inputRef = useRef<HTMLInputElement>(null);
  const data = resolved.startsWith("data:");

  const picture = data ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={resolved.slice(0, 80)}
      src={resolved}
      alt={alt}
      className={fill ? `absolute inset-0 h-full w-full object-cover ${className}` : className}
    />
  ) : (
    <Image
      key={resolved}
      src={resolved}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes ?? (fill ? "100vw" : undefined)}
      priority={priority}
    />
  );

  if (hidden && !admin) return null;

  if (!admin) return picture;

  if (hidden) {
    return (
      <div className={fill ? "absolute inset-0 flex items-center justify-center bg-[#E6E0D7]" : "relative flex min-h-24 items-center justify-center rounded-xl bg-[#E6E0D7] px-3 py-6"}>
        <button
          type="button"
          className="rounded-full bg-[#2D3B2D] px-3 py-1.5 font-sans text-[0.52rem] uppercase tracking-[0.16em] text-[#F9F7F2]"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            showSiteItem(id);
          }}
        >
          Restore photo
        </button>
      </div>
    );
  }

  return (
    <div className={fill ? "absolute inset-0" : "relative"}>
      {picture}
      <div className="absolute bottom-2 right-2 z-[2] flex gap-1">
        <button
          type="button"
          className="rounded-full bg-[#2D3B2D]/90 px-3 py-1.5 font-sans text-[0.52rem] uppercase tracking-[0.16em] text-[#F9F7F2] hover:bg-[#2D3B2D]"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            inputRef.current?.click();
          }}
        >
          Replace
        </button>
        {deletable ? (
          <button
            type="button"
            className="rounded-full bg-[#242424]/80 px-3 py-1.5 font-sans text-[0.52rem] uppercase tracking-[0.16em] text-[#F9F7F2] hover:bg-[#242424]"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              hideSiteItem(id);
            }}
          >
            Delete
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const url = await readImageAsCompressedDataUrl(file);
          updateSiteImage(id, url);
          event.target.value = "";
        }}
      />
    </div>
  );
}
