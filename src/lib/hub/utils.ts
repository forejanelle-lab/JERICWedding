import type { InviteRecord, WeekendEvent } from "@/lib/hub/types";
import { DEFAULT_GUEST_TAGS } from "@/lib/hub/access";
import type { Locale } from "@/lib/i18n/config";

const DATE_LOCALES: Record<Locale, string> = {
  en: "en-US",
  it: "it-IT",
  es: "es-ES",
};

export function formatTime(value: string, locale: Locale = "en") {
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours)) return value;
  if (locale !== "en") {
    return `${String(hours).padStart(2, "0")}:${String(minutes ?? 0).padStart(2, "0")}`;
  }
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes ?? 0).padStart(2, "0")} ${suffix}`;
}

export function formatDate(value: string, locale: Locale = "en") {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(DATE_LOCALES[locale] ?? "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 14) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function downloadIcs(event: WeekendEvent) {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Janelle and Eric//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@jeric.wedding`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART:${event.dtstart}`,
    `DTEND:${event.dtend}`,
    `SUMMARY:${event.title} — Janelle & Eric`,
    `LOCATION:${event.address}`,
    `DESCRIPTION:${event.notes} Dress: ${event.dress}. ${event.transport}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.id}-janelle-eric.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function mapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function osmEmbed(query: string) {
  const presets: Record<string, string> = {
    "Casale+dei+Mascioni+San+Prisco": "https://www.openstreetmap.org/export/embed.html?bbox=14.15%2C41.00%2C14.40%2C41.15&layer=mapnik&marker=41.085%2C14.28",
    "Positano+Italy": "https://www.openstreetmap.org/export/embed.html?bbox=14.45%2C40.61%2C14.52%2C40.65&layer=mapnik&marker=40.628%2C14.485",
    "Napoli": "https://www.openstreetmap.org/export/embed.html?bbox=14.20%2C40.82%2C14.30%2C40.87&layer=mapnik&marker=40.851%2C14.268",
  };
  return (
    presets[query] ??
    `https://www.openstreetmap.org/export/embed.html?bbox=13.8%2C40.2%2C15.5%2C41.5&layer=mapnik`
  );
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const MAX_PHOTO_EDGE = 1400;
const JPEG_QUALITY = 0.74;

function fitSize(width: number, height: number, maxEdge: number) {
  const edge = Math.max(width, height);
  if (edge <= maxEdge) return { width, height };
  const scale = maxEdge / edge;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

function canvasToJpeg(source: CanvasImageSource, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(source, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

function loadHtmlImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image"));
    image.src = src;
  });
}

export async function readImageAsCompressedDataUrl(file: File): Promise<string> {
  if (!file.size) throw new Error("empty");
  if (file.type && !file.type.startsWith("image/")) throw new Error("not-image");

  try {
    if (typeof createImageBitmap === "function") {
      const bitmap = await createImageBitmap(file);
      try {
        const size = fitSize(bitmap.width, bitmap.height, MAX_PHOTO_EDGE);
        return canvasToJpeg(bitmap, size.width, size.height);
      } finally {
        bitmap.close();
      }
    }
  } catch {
    // HEIC and some phone formats fail here; try a regular image decode next.
  }

  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadHtmlImage(dataUrl);
  const size = fitSize(image.naturalWidth || image.width, image.naturalHeight || image.height, MAX_PHOTO_EDGE);
  return canvasToJpeg(image, size.width, size.height);
}

export function parseInviteCsv(text: string): InviteRecord[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const header = splitCsvLine(lines[0]).map((cell) => cell.toLowerCase().replace(/\s+/g, ""));
  const idx = (name: string) => header.indexOf(name);

  return lines.slice(1).flatMap((line, index) => {
    const cells = splitCsvLine(line);
    const get = (name: string) => cells[idx(name)]?.trim() ?? "";
    const firstName = get("firstname") || get("first") || get("name").split(" ")[0];
    const lastName = get("lastname") || get("last") || get("name").split(" ").slice(1).join(" ");
    if (!firstName || !lastName) return [];
    const location = get("location") || get("city") || get("from");
    const italyRaw = (get("initaly") || get("italy") || "").toLowerCase();
    const inItaly =
      italyRaw === "true" ||
      italyRaw === "yes" ||
      italyRaw === "1" ||
      /italy/i.test(location);
    const party = (get("party") || get("plusones") || get("guests"))
      .split(/[,;|]/)
      .map((name) => name.trim())
      .filter(Boolean);
    const events = (get("events") || "welcome,ceremony,reception,brunch")
      .split(/[|,]/)
      .map((item) => item.trim())
      .filter(Boolean) as InviteRecord["events"];
    return [
      {
        id: `csv-${Date.now()}-${index}`,
        firstName,
        lastName,
        email: get("email"),
        location,
        inItaly,
        party,
        events: events.length ? events : ["welcome", "ceremony", "reception", "brunch"],
        tags: (get("tags") || DEFAULT_GUEST_TAGS.join(","))
          .split(/[|,]/)
          .map((item) => item.trim())
          .filter(Boolean),
        invited: true,
        entered: false,
      },
    ];
  });
}

function splitCsvLine(line: string) {
  const out: string[] = [];
  let current = "";
  let quoted = false;
  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      out.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  out.push(current);
  return out;
}
