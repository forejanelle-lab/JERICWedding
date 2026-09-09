"use client";

import { useState } from "react";
import Link from "next/link";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { readFileAsDataUrl } from "@/lib/hub/utils";
import type { PhotoAlbum } from "@/lib/hub/types";

export function PhotoUpload({ next = "/photos" }: { next?: string }) {
  const { state, uploadPhoto } = useHub();
  const { t } = useI18n();
  const [sent, setSent] = useState(false);

  if (!state.identity) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <Link href={`/join?next=${encodeURIComponent(next)}`} className="btn-primary">
          {t("photos.upload")}
        </Link>
        <p className="font-sans text-sm text-charcoal/60">{t("photos.joinFirst")}</p>
      </div>
    );
  }

  if (sent) {
    return (
      <p className="font-script text-xl italic text-olive">
        {t("photos.received")}
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const file = data.get("file");
        if (!(file instanceof File) || !file.size) return;
        const src = await readFileAsDataUrl(file);
        uploadPhoto(String(data.get("album")) as PhotoAlbum, String(data.get("caption")), src);
        setSent(true);
      }}
    >
      <label className="min-w-[8rem]">
        <span className="label-caps">{t("photos.album")}</span>
        <select name="album" className="input-line" defaultValue="recent">
          <option value="recent">{t("photos.recent")}</option>
          <option value="friday">{t("photos.saturday")}</option>
          <option value="wedding">{t("photos.weddingDay")}</option>
          <option value="sunday">{t("photos.monday")}</option>
          <option value="travel">{t("photos.travel")}</option>
        </select>
      </label>
      <label className="min-w-[12rem] flex-1">
        <span className="label-caps">{t("photos.captionLabel")}</span>
        <input name="caption" placeholder={t("photos.captionPh")} className="input-line" />
      </label>
      <label className="min-w-[10rem]">
        <span className="label-caps">{t("photos.file")}</span>
        <input name="file" type="file" accept="image/*" required className="mt-3 font-sans text-sm" />
      </label>
      <button type="submit" className="btn-primary shrink-0">
        {t("photos.uploadBtn")}
      </button>
    </form>
  );
}
