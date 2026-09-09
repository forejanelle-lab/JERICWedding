"use client";

import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function LanguageSelect({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { locale, setLocale, t } = useI18n();
  const light = tone === "light";
  return (
    <label className="inline-flex items-center gap-2">
      <span className="sr-only">{t("ui.language")}</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as typeof locale)}
        aria-label={t("ui.language")}
        className={`min-h-11 cursor-pointer appearance-none rounded-full border bg-transparent py-2 pl-3.5 pr-8 font-sans text-[0.7rem] uppercase tracking-[0.12em] outline-none md:py-1 md:pl-3 md:pr-7 md:text-[0.58rem] md:tracking-[0.16em] ${
          light
            ? "border-[#F9F7F2]/35 text-[#F9F7F2] [color-scheme:dark]"
            : "border-[#242424]/20 text-[#242424]"
        }`}
      >
        {LOCALES.map((item) => (
          <option key={item} value={item} className="text-[#242424]">
            {LOCALE_LABELS[item]}
          </option>
        ))}
      </select>
    </label>
  );
}
