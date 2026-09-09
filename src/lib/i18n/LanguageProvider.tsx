"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { interpolate, isLocale, LANG_COOKIE, type Locale } from "@/lib/i18n/config";
import { DICTS } from "@/lib/i18n/dictionaries";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  has: (key: string) => boolean;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function writeCookie(locale: Locale) {
  document.cookie = `${LANG_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

function readCookie(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function LanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const cookie = readCookie();
    if (isLocale(cookie)) {
      if (cookie !== locale) setLocaleState(cookie);
      return;
    }
    let cancelled = false;
    fetch("/api/geo")
      .then((response) => response.json())
      .then((data: { locale?: string }) => {
        if (cancelled) return;
        const next = isLocale(data.locale) ? data.locale : locale;
        setLocaleState(next);
        writeCookie(next);
      })
      .catch(() => {
        if (!cancelled) writeCookie(locale);
      });
    return () => {
      cancelled = true;
    };
    // Detect once on mount; locale is the server guess.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeCookie(next);
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const dict = DICTS[locale];
    const english = DICTS.en;
    return {
      locale,
      setLocale,
      t(key, vars) {
        const raw = dict[key] ?? english[key] ?? key;
        return interpolate(raw, vars);
      },
      has(key) {
        return Boolean(dict[key]);
      },
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within LanguageProvider");
  }
  return context;
}
