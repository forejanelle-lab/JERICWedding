export const LANG_COOKIE = "jeric_lang";
export const LOCALES = ["en", "it", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  it: "Italiano",
  es: "Español",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "it" || value === "es";
}

export function localeFromGeo(country?: string | null, region?: string | null, regionName?: string | null): Locale {
  const c = (country ?? "").toUpperCase();
  const r = (region ?? "").toUpperCase();
  const name = (regionName ?? "").toLowerCase();
  if (c === "IT") return "it";
  if (c === "ES" || c === "PR") return "es";
  if (c === "US" && (r === "PR" || name.includes("puerto rico"))) return "es";
  return "en";
}

export function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}
