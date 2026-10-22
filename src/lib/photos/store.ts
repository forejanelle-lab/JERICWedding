import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { GuestPhoto } from "@/lib/hub/types";

const FILE = path.join(process.cwd(), ".data", "photos.json");
const KV_KEY = "jeric-photos";
const SUPABASE_ROW = "photos";
const MAX_PHOTOS = 200;

type PhotoStore = { photos: GuestPhoto[] };
type GlobalPhotos = { store?: PhotoStore };

function memory() {
  const global = globalThis as typeof globalThis & { __jericPhotos?: GlobalPhotos };
  if (!global.__jericPhotos) global.__jericPhotos = {};
  return global.__jericPhotos;
}

function normalizePhoto(raw: Partial<GuestPhoto> | null | undefined): GuestPhoto | null {
  const id = String(raw?.id ?? "").trim();
  const src = String(raw?.src ?? "").trim();
  if (!id || !src) return null;
  return {
    id,
    authorId: String(raw?.authorId ?? ""),
    album: String(raw?.album ?? "recent"),
    caption: String(raw?.caption ?? ""),
    src,
    approved: raw?.approved !== false,
    createdAt: String(raw?.createdAt ?? new Date().toISOString()),
  };
}

function normalizeStore(raw: unknown): PhotoStore {
  const value = (raw ?? {}) as Partial<PhotoStore>;
  const photos = Array.isArray(value.photos)
    ? value.photos.map((item) => normalizePhoto(item)).filter((item): item is GuestPhoto => Boolean(item)).slice(0, MAX_PHOTOS)
    : [];
  return { photos };
}

async function fromKv(): Promise<PhotoStore | null> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
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

async function toKv(store: PhotoStore) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;
  await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(["SET", KV_KEY, JSON.stringify(store)]),
  });
}

function supabaseRest() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

async function fromSupabase(): Promise<PhotoStore | null> {
  const rest = supabaseRest();
  if (!rest) return null;
  try {
    const response = await fetch(`${rest.url}/rest/v1/ride_digest_store?id=eq.${SUPABASE_ROW}&select=payload`, {
      headers: { apikey: rest.key, Authorization: `Bearer ${rest.key}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const rows = (await response.json()) as { payload?: unknown }[];
    if (!rows[0]?.payload) return null;
    return normalizeStore(rows[0].payload);
  } catch {
    return null;
  }
}

async function toSupabase(store: PhotoStore) {
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

async function fromFile(): Promise<PhotoStore | null> {
  try {
    return normalizeStore(JSON.parse(await readFile(FILE, "utf8")));
  } catch {
    return null;
  }
}

async function toFile(store: PhotoStore) {
  try {
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify(store));
  } catch {
    // Hosts like Vercel cannot write the project directory.
  }
}

export async function loadPhotos(): Promise<GuestPhoto[]> {
  const cached = memory().store;
  if (cached) return normalizeStore(cached).photos;
  const store = (await fromKv()) ?? (await fromSupabase()) ?? (await fromFile()) ?? { photos: [] };
  memory().store = store;
  return store.photos;
}

async function savePhotos(photos: GuestPhoto[]) {
  const store = { photos: photos.slice(0, MAX_PHOTOS) };
  memory().store = store;
  await Promise.all([toKv(store), toSupabase(store), toFile(store)]);
  return store.photos;
}

export async function upsertPhoto(photo: GuestPhoto) {
  const normalized = normalizePhoto(photo);
  if (!normalized) return loadPhotos();
  const photos = await loadPhotos();
  const next = [normalized, ...photos.filter((item) => item.id !== normalized.id)];
  return savePhotos(next);
}

export async function removePhoto(id: string) {
  const photos = await loadPhotos();
  return savePhotos(photos.filter((item) => item.id !== id));
}
