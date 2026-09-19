import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { EventId, RsvpRecord, StayArea } from "@/lib/hub/types";
import { rsvpIdentityKey } from "@/lib/rsvp/merge";

export type RsvpStore = {
  rsvps: RsvpRecord[];
};

const EMPTY: RsvpStore = { rsvps: [] };
const FILE = path.join(process.cwd(), ".data", "rsvps.json");
const KV_KEY = "jeric-rsvps";
const SUPABASE_ROW = "rsvps";
const MAX_RSVPS = 2000;
const ALL_EVENTS: EventId[] = ["welcome", "ceremony", "reception", "brunch"];
const STAYS: StayArea[] = ["sorrento", "naples", "caserta", "rome", "amalfi", "villa", "other"];

type GlobalRsvps = { store?: RsvpStore };

function memory() {
  const global = globalThis as typeof globalThis & { __jericRsvps?: GlobalRsvps };
  if (!global.__jericRsvps) global.__jericRsvps = {};
  return global.__jericRsvps;
}

function rsvpKey(rsvp: Pick<RsvpRecord, "email" | "name" | "inviteId">) {
  return rsvpIdentityKey(rsvp);
}

export function normalizeRsvp(raw: Partial<RsvpRecord> | null | undefined, index = 0): RsvpRecord | null {
  const name = String(raw?.name ?? "").trim();
  if (!name) return null;
  const events = Array.isArray(raw?.events)
    ? raw.events.filter((item): item is EventId => ALL_EVENTS.includes(item as EventId))
    : [];
  const stayRaw = String(raw?.stay ?? "").trim();
  const stay = STAYS.includes(stayRaw as StayArea) ? (stayRaw as StayArea) : "";
  const submittedAt = String(raw?.submittedAt ?? "");
  const stamp = Number.isNaN(new Date(submittedAt).getTime()) ? new Date().toISOString() : submittedAt;
  return {
    id: String(raw?.id ?? `rsvp-${index}`).trim() || `rsvp-${index}`,
    name,
    email: String(raw?.email ?? "").trim().toLowerCase(),
    attending: Boolean(raw?.attending),
    events,
    guestCount: Number(raw?.guestCount) || (Array.isArray(raw?.partyAttending) ? raw.partyAttending.length : 0),
    dietary: String(raw?.dietary ?? "").trim(),
    song: String(raw?.song ?? "").trim(),
    airport: String(raw?.airport ?? "").trim(),
    arrivalDate: String(raw?.arrivalDate ?? "").trim(),
    arrivalTime: String(raw?.arrivalTime ?? "").trim(),
    departureDate: String(raw?.departureDate ?? "").trim(),
    departureTime: String(raw?.departureTime ?? "").trim(),
    stay,
    inviteId: String(raw?.inviteId ?? "").trim(),
    partyAttending: Array.isArray(raw?.partyAttending)
      ? raw.partyAttending.map((item) => String(item).trim()).filter(Boolean)
      : [],
    submittedAt: stamp,
  };
}

function normalizeStore(raw: unknown): RsvpStore {
  const value = (raw ?? {}) as Partial<RsvpStore>;
  const rsvps = Array.isArray(value.rsvps)
    ? value.rsvps.map((item, index) => normalizeRsvp(item, index)).filter((item): item is RsvpRecord => Boolean(item))
    : [];
  return { rsvps };
}

async function fromKv(): Promise<RsvpStore | null> {
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

async function toKv(store: RsvpStore) {
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

async function fromSupabase(): Promise<RsvpStore | null> {
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

async function toSupabase(store: RsvpStore) {
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

async function fromFile(): Promise<RsvpStore | null> {
  try {
    const raw = await readFile(FILE, "utf8");
    return normalizeStore(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function toFile(store: RsvpStore) {
  try {
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify(store, null, 2));
  } catch {
    // Vercel and similar hosts are read-only besides /tmp.
  }
}

export async function loadRsvpStore(): Promise<RsvpStore> {
  const cached = memory().store;
  if (cached) return cached;
  const store = (await fromKv()) ?? (await fromSupabase()) ?? (await fromFile()) ?? { ...EMPTY, rsvps: [] };
  memory().store = store;
  return store;
}

async function saveRsvpStore(store: RsvpStore) {
  memory().store = store;
  await Promise.all([toKv(store), toSupabase(store), toFile(store)]);
}

export async function upsertRsvp(input: Partial<RsvpRecord>) {
  const nextRsvp = normalizeRsvp({
    ...input,
    id: input.id?.trim() || `rsvp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    submittedAt: input.submittedAt || new Date().toISOString(),
  });
  if (!nextRsvp) return loadRsvpStore();

  const store = await loadRsvpStore();
  const key = rsvpKey(nextRsvp);
  const rsvps = [nextRsvp, ...store.rsvps.filter((item) => rsvpKey(item) !== key && item.id !== nextRsvp.id)].slice(
    0,
    MAX_RSVPS,
  );
  const next = { rsvps };
  await saveRsvpStore(next);
  return next;
}

export async function resetRsvpStore() {
  const next: RsvpStore = { rsvps: [] };
  memory().store = next;
  await saveRsvpStore(next);
  return next;
}
