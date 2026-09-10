import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { SiteContent } from "@/lib/site-content/types";

const FILE = path.join(process.cwd(), ".data", "site-content.json");
const KV_KEY = "jeric-site-content";
const SUPABASE_ROW = "site-content";
const DEFAULT_HERO = "/images/casale-bosco.jpg";

const EMPTY: SiteContent = {
  siteCopy: {},
  siteImages: {},
  siteHidden: [],
  hiddenPages: [],
  heroImage: DEFAULT_HERO,
};

type GlobalContent = { store?: SiteContent };

function memory() {
  const global = globalThis as typeof globalThis & { __jericSiteContent?: GlobalContent };
  if (!global.__jericSiteContent) global.__jericSiteContent = {};
  return global.__jericSiteContent;
}

function asRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[0] === "string" && typeof entry[1] === "string" && Boolean(entry[1]),
    ),
  );
}

function normalizeStore(raw: unknown): SiteContent {
  const value = (raw ?? {}) as Partial<SiteContent>;
  return {
    siteCopy: asRecord(value.siteCopy),
    siteImages: asRecord(value.siteImages),
    siteHidden: Array.isArray(value.siteHidden) ? value.siteHidden.map(String) : [],
    hiddenPages: Array.isArray(value.hiddenPages) ? value.hiddenPages.map(String) : [],
    heroImage: typeof value.heroImage === "string" && value.heroImage ? value.heroImage : DEFAULT_HERO,
  };
}

async function fromKv(): Promise<SiteContent | null> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["GET", KV_KEY]),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { result?: string | null };
    if (!payload.result) return null;
    return normalizeStore(JSON.parse(payload.result));
  } catch {
    return null;
  }
}

async function toKv(store: SiteContent) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;
  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["SET", KV_KEY, JSON.stringify(store)]),
  });
}

function supabaseRest() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

async function fromSupabase(): Promise<SiteContent | null> {
  const rest = supabaseRest();
  if (!rest) return null;
  try {
    const response = await fetch(
      `${rest.url}/rest/v1/ride_digest_store?id=eq.${SUPABASE_ROW}&select=payload`,
      {
        headers: {
          apikey: rest.key,
          Authorization: `Bearer ${rest.key}`,
        },
        cache: "no-store",
      },
    );
    if (!response.ok) return null;
    const rows = (await response.json()) as { payload?: unknown }[];
    if (!rows[0]?.payload) return null;
    return normalizeStore(rows[0].payload);
  } catch {
    return null;
  }
}

async function toSupabase(store: SiteContent) {
  const rest = supabaseRest();
  if (!rest) return;
  await fetch(`${rest.url}/rest/v1/ride_digest_store`, {
    method: "POST",
    headers: {
      apikey: rest.key,
      Authorization: `Bearer ${rest.key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ id: SUPABASE_ROW, payload: store }),
  });
}

async function fromFile(): Promise<SiteContent | null> {
  try {
    const raw = await readFile(FILE, "utf8");
    return normalizeStore(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function toFile(store: SiteContent) {
  try {
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify(store));
  } catch {
    // Vercel and similar hosts are read-only besides /tmp.
  }
}

export async function loadSiteContent(): Promise<SiteContent> {
  const cached = memory().store;
  if (cached) return cached;
  const store = (await fromKv()) ?? (await fromSupabase()) ?? (await fromFile()) ?? { ...EMPTY };
  memory().store = store;
  return store;
}

async function saveSiteContent(store: SiteContent) {
  memory().store = store;
  await Promise.all([toKv(store), toSupabase(store), toFile(store)]);
}

export async function replaceSiteContent(content: SiteContent) {
  const next = normalizeStore(content);
  await saveSiteContent(next);
  return next;
}

export async function resetSiteContent() {
  const next = { ...EMPTY, siteCopy: {}, siteImages: {}, siteHidden: [], hiddenPages: [] };
  memory().store = next;
  await saveSiteContent(next);
  return next;
}
