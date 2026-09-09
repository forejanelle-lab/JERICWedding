"use client";

import { useEffect, useState } from "react";
import { PageHeader, SectionWrap } from "@/components/site/PageHeader";
import { EditText } from "@/components/site/EditText";
import { SONG_CATEGORIES } from "@/lib/hub/content";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { SongCategory } from "@/lib/hub/types";

export default function SongsPage() {
  const { state, voteSong, suggestSong } = useHub();
  const { t } = useI18n();
  const [category, setCategory] = useState<SongCategory | "all">("all");
  const [voterId, setVoterId] = useState("");
  const [notice, setNotice] = useState("");
  const songs = state.songs
    .filter((song) => song.approved && (category === "all" || song.category === category))
    .sort((a, b) => b.ups.length - b.downs.length - (a.ups.length - a.downs.length));

  useEffect(() => {
    fetch("/api/voter")
      .then((response) => response.json())
      .then((data: { voterId?: string }) => {
        if (data.voterId) setVoterId(data.voterId);
      })
      .catch(() => {
        setVoterId("");
      });
  }, []);

  function vote(id: string, direction: "up" | "down") {
    if (!voterId) {
      setNotice(t("songs.voteFail"));
      return;
    }
    const song = state.songs.find((item) => item.id === id);
    if (!song) return;
    const already =
      direction === "up" ? song.ups.includes(voterId) : song.downs.includes(voterId);
    if (already) {
      setNotice(t("songs.oneVote"));
      return;
    }
    voteSong(id, direction, voterId);
    setNotice("");
  }

  return (
    <main className="pt-[3.4rem]">
      <SectionWrap className="bg-ivory !py-8 md:!py-10">
        <PageHeader
          compact
          editId="songs"
          eyebrow="Help us fill the floor"
          title="What should we dance to?"
          description="Add a song, then thumbs up or down. One vote per song per connection."
        />

        <div className="mx-auto mt-8 grid max-w-6xl items-start gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <form
            className="space-y-4 rounded-2xl border border-taupe/15 bg-cream p-6 lg:sticky lg:top-24"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              suggestSong(
                String(data.get("title")),
                String(data.get("artist")),
                String(data.get("category")) as SongCategory,
                String(data.get("by") || ""),
              );
              event.currentTarget.reset();
            }}
          >
            <EditText id="songs.add" as="h2" className="font-serif text-2xl uppercase">
              Add a song
            </EditText>
            <input name="title" required placeholder={t("songs.title")} className="input-line" />
            <input name="artist" required placeholder={t("songs.artist")} className="input-line" />
            <select name="category" className="input-line" defaultValue="classics">
              {SONG_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>{t(`song.${item.id}`)}</option>
              ))}
            </select>
            <input name="by" placeholder={t("songs.yourName")} className="input-line" />
            <button type="submit" className="btn-primary">
              {t("songs.addSong")}
            </button>
          </form>

          <div>
            <div className="flex flex-wrap gap-2">
              {[{ id: "all" as const, label: t("songs.all") }, ...SONG_CATEGORIES.map((item) => ({ ...item, label: t(`song.${item.id}`) }))].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id)}
                  className={`rounded-full px-4 py-2 font-sans text-[0.6rem] uppercase tracking-[0.16em] ${
                    category === item.id ? "bg-forest text-ivory" : "bg-cream"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {notice ? <p className="mt-4 font-sans text-sm text-olive">{notice}</p> : null}
            <ol className="mt-5 space-y-3">
              {songs.map((song, index) => {
                const mineUp = voterId ? song.ups.includes(voterId) : false;
                const mineDown = voterId ? song.downs.includes(voterId) : false;
                return (
                  <li key={song.id} className="soft-card flex items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="font-sans text-xs text-olive">#{index + 1} · {song.category}</p>
                      <p className="font-serif text-xl">{song.title}</p>
                      <p className="font-sans text-sm text-taupe">{song.artist} · {song.suggestedBy}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={t("songs.thumbsUp")}
                        className={`rounded-full border px-3 py-2 font-sans text-sm ${mineUp ? "border-forest bg-sage/20" : "border-taupe/20"}`}
                        onClick={() => vote(song.id, "up")}
                      >
                        ▲ {song.ups.length}
                      </button>
                      <button
                        type="button"
                        aria-label={t("songs.thumbsDown")}
                        className={`rounded-full border px-3 py-2 font-sans text-sm ${mineDown ? "border-taupe bg-beige/40" : "border-taupe/20"}`}
                        onClick={() => vote(song.id, "down")}
                      >
                        ▼ {song.downs.length}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </SectionWrap>
    </main>
  );
}
