"use client";

import { EditImage } from "@/components/site/EditImage";
import { EditText } from "@/components/site/EditText";
import { useHub } from "@/lib/hub/store";

export function PhotoTile({
  id,
  src,
  caption,
  alt,
  onOpen,
}: {
  id: string;
  src: string;
  caption: string;
  alt?: string;
  onOpen?: () => void;
}) {
  const { state } = useHub();
  const hidden = state.siteHidden.includes(id);
  if (hidden && !state.adminAuthed) return null;

  return (
    <figure className="min-w-0">
      <button
        type="button"
        className="relative aspect-square w-full overflow-hidden rounded-xl"
        onClick={() => {
          if (!hidden) onOpen?.();
        }}
      >
        <EditImage id={id} src={src} alt={alt ?? caption} fill className="object-cover" />
      </button>
      {hidden ? null : (
        <EditText
          id={`${id}.caption`}
          as="figcaption"
          className="mt-1.5 font-sans text-[0.7rem] leading-snug text-charcoal/65"
        >
          {caption}
        </EditText>
      )}
    </figure>
  );
}
