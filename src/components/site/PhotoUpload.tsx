"use client";

import { useState } from "react";
import Link from "next/link";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { readImageAsCompressedDataUrl } from "@/lib/hub/utils";
import type { PhotoAlbum } from "@/lib/hub/types";

export function PhotoUpload({ next = "/photos" }: { next?: string }) {
  const { state, ready, uploadPhoto } = useHub();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  if (!ready) return null;

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

  return (
    <form
      className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const file = data.get("file");
        if (!(file instanceof File) || !file.size) {
          setError(t("photos.needFile"));
          return;
        }
        setBusy(true);
        setError("");
        setSent(false);
        try {
          const src = await readImageAsCompressedDataUrl(file);
          uploadPhoto(String(data.get("album")) as PhotoAlbum, String(data.get("caption") ?? "").trim(), src);
          setSent(true);
          setFileName("");
          form.reset();
        } catch {
          setError(t("photos.error"));
        } finally {
          setBusy(false);
        }
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
        <input
          name="file"
          type="file"
          accept="image/*,image/heic,image/heif"
          required
          className="mt-3 w-full max-w-[16rem] font-sans text-sm file:mr-3 file:rounded-full file:border-0 file:bg-olive file:px-3 file:py-1.5 file:font-sans file:text-[0.58rem] file:uppercase file:tracking-[0.16em] file:text-ivory"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setFileName(file?.name ?? "");
            setSent(false);
            setError("");
          }}
        />
        {fileName ? <p className="mt-1 font-sans text-[0.7rem] text-charcoal/55">{fileName}</p> : null}
      </label>
      <button type="submit" disabled={busy} className="btn-primary shrink-0 disabled:opacity-60">
        {busy ? t("photos.uploading") : t("photos.uploadBtn")}
      </button>
      {sent ? <p className="w-full font-script text-xl italic text-olive">{t("photos.received")}</p> : null}
      {error ? <p className="w-full font-sans text-sm text-olive">{error}</p> : null}
    </form>
  );
}
