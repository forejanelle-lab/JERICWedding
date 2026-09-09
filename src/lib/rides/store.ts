import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { RideKind } from "@/lib/hub/types";
import { isUsableEmail, normalizeEmail } from "@/lib/rides/emails";

export type DigestPost = {
  id: string;
  kind: RideKind;
  authorName: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  notes: string;
  postedAt: string;
  dayKey: string;
};

export type DigestStore = {
  subscribers: string[];
  unsubscribed: string[];
  posts: DigestPost[];
  sentPostIds: string[];
};

const EMPTY: DigestStore = {
  subscribers: [],
  unsubscribed: [],
  posts: [],
  sentPostIds: [],
};

const FILE = path.join(process.cwd(), ".data", "ride-digest.json");
const KV_KEY = "jeric-ride-digest";
const SUPABASE_ROW = "live";

type GlobalDigest = { store?: DigestStore; writing?: Promise<void> };

function memory() {
  const global = globalThis as typeof globalThis & { __jericRideDigest?: GlobalDigest };
  if (!global.__jericRideDigest) global.__jericRideDigest = {};
  return global.__jericRideDigest;
}

export function romeDayKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function normalizeStore(raw: unknown): DigestStore {
  const value = (raw ?? {}) as Partial<DigestStore> & { sentDays?: string[] };
  return {
    subscribers: Array.isArray(value.subscribers) ? value.subscribers : [],
    unsubscribed: Array.isArray(value.unsubscribed) ? value.unsubscribed : [],
    posts: Array.isArray(value.posts) ? value.posts : [],
    sentPostIds: Array.isArray(value.sentPostIds) ? value.sentPostIds : [],
  };
}

export function pendingDigestPosts(store: DigestStore) {
  const sent = new Set(store.sentPostIds);
  return store.posts.filter((post) => !sent.has(post.id));
}

async function fromKv(): Promise<DigestStore | null> {
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

async function toKv(store: DigestStore) {
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

async function fromSupabase(): Promise<DigestStore | null> {
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

async function toSupabase(store: DigestStore) {
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

async function fromFile(): Promise<DigestStore | null> {
  try {
    const raw = await readFile(FILE, "utf8");
    return normalizeStore(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function toFile(store: DigestStore) {
  try {
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify(store, null, 2));
  } catch {
    // Vercel and similar hosts are read-only besides /tmp.
  }
}

export async function loadDigestStore(): Promise<DigestStore> {
  const cached = memory().store;
  if (cached) return cached;
  const store =
    (await fromKv()) ??
    (await fromSupabase()) ??
    (await fromFile()) ??
    { ...EMPTY, subscribers: [], unsubscribed: [], posts: [], sentPostIds: [] };
  memory().store = store;
  return store;
}

async function saveDigestStore(store: DigestStore) {
  memory().store = store;
  await Promise.all([toKv(store), toSupabase(store), toFile(store)]);
}

export async function queueDigestPost(input: {
  post: Omit<DigestPost, "dayKey" | "postedAt"> & { postedAt?: string };
  emails: string[];
}) {
  const store = await loadDigestStore();
  const unsubscribed = new Set(store.unsubscribed.map(normalizeEmail));
  const incoming = input.emails.map(normalizeEmail).filter((email) => isUsableEmail(email) && !unsubscribed.has(email));
  const subscribers = new Set(store.subscribers.map(normalizeEmail));
  for (const email of incoming) subscribers.add(email);

  const post: DigestPost = {
    ...input.post,
    postedAt: input.post.postedAt ?? new Date().toISOString(),
    dayKey: romeDayKey(),
  };
  const posts = store.posts.some((item) => item.id === post.id)
    ? store.posts.map((item) => (item.id === post.id ? post : item))
    : [...store.posts, post];

  const next = {
    ...store,
    subscribers: [...subscribers],
    posts,
  };
  await saveDigestStore(next);
  return next;
}

export async function syncDigestEmails(emails: string[]) {
  const store = await loadDigestStore();
  const unsubscribed = new Set(store.unsubscribed.map(normalizeEmail));
  const subscribers = new Set(store.subscribers.map(normalizeEmail));
  for (const email of emails.map(normalizeEmail).filter(isUsableEmail)) {
    if (!unsubscribed.has(email)) subscribers.add(email);
  }
  const next = { ...store, subscribers: [...subscribers] };
  await saveDigestStore(next);
  return next;
}

export async function unsubscribeEmail(email: string) {
  const value = normalizeEmail(email);
  const store = await loadDigestStore();
  const next = {
    ...store,
    subscribers: store.subscribers.filter((item) => normalizeEmail(item) !== value),
    unsubscribed: store.unsubscribed.includes(value)
      ? store.unsubscribed
      : [...store.unsubscribed, value],
  };
  await saveDigestStore(next);
  return next;
}

export async function markPostsSent(ids: string[]) {
  const store = await loadDigestStore();
  const sent = new Set(store.sentPostIds);
  for (const id of ids) sent.add(id);
  const next = { ...store, sentPostIds: [...sent] };
  await saveDigestStore(next);
  return next;
}
