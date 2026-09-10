"use client";

import { useRef } from "react";
import Image from "next/image";
import { canEditWebsite } from "@/lib/hub/access";
import { useHub } from "@/lib/hub/store";
import { readFileAsDataUrl, readImageAsCompressedDataUrl } from "@/lib/hub/utils";

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
  const custom = state.siteImages[id];
  const resolved = custom ?? src;
  const admin = canEditWebsite(state) && state.siteEditing;
  const inputRef = useRef<HTMLInputElement>(null);
  const data = resolved.startsWith("data:") || Boolean(custom);

  const picture = data ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={resolved.slice(0, 48)}
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
      <div className={fill ? "absolute inset-0 z-20 flex items-center justify-center bg-[#E6E0D7]" : "relative z-20 flex min-h-24 items-center justify-center rounded-xl bg-[#E6E0D7] px-3 py-6"}>
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
    <div
      className={fill ? "absolute inset-0 z-20" : "relative z-20"}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {picture}
      <div className="pointer-events-auto absolute left-2 top-2 z-30 flex gap-1">
        <button
          type="button"
          className="rounded-full bg-[#2D3B2D] px-3 py-1.5 font-sans text-[0.52rem] uppercase tracking-[0.16em] text-[#F9F7F2] shadow-sm hover:bg-[#3d4f3d]"
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
            className="rounded-full bg-[#242424] px-3 py-1.5 font-sans text-[0.52rem] uppercase tracking-[0.16em] text-[#F9F7F2] shadow-sm hover:bg-[#111]"
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
          event.target.value = "";
          if (!file) return;
          try {
            updateSiteImage(id, await readImageAsCompressedDataUrl(file));
          } catch {
            try {
              updateSiteImage(id, await readFileAsDataUrl(file));
            } catch {
              // Keep the current photo if the file cannot be read.
            }
          }
        }}
      />
    </div>
  );
}
