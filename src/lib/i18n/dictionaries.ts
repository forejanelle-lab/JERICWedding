import type { Locale } from "@/lib/i18n/config";
import { en } from "@/lib/i18n/en";
import { es } from "@/lib/i18n/es";
import { it } from "@/lib/i18n/it";

export const DICTS: Record<Locale, Record<string, string>> = { en, it, es };

export const NAV_I18N: Record<string, string> = {
  "/rsvp": "nav.rsvp",
  "/story": "nav.story",
  "/weekend": "nav.weekend",
  "/travel": "nav.travel",
  "/photos": "nav.photos",
  "/rides": "nav.rides",
  "/play": "nav.play",
  "/songs": "nav.songs",
  "/things-to-do": "nav.todo",
  "/faq": "nav.faq",
  "/registry": "nav.registry",
  "/": "nav.home",
};
