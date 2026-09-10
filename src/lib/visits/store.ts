import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import type { SiteVisit, VisitKind, VisitorSummary } from "@/lib/visits/types";

export type { SiteVisit, VisitKind, VisitorSummary };

export type VisitStore = {
  events: SiteVisit[];
};

const EMPTY: VisitStore = { events: [] };
const FILE = path.join(process.cwd(), ".data", "visits.json");
const KV_KEY = "jeric-visits";
const SUPABASE_ROW = "visits";
const MAX_EVENTS = 400;

type GlobalVisits = { store?: VisitStore };

function memory() {
  const global = globalThis as typeof globalThis & { __jericVisits?: GlobalVisits };
  if (!global.__jericVisits) global.__jericVisits = {};
  return global.__jericVisits;
}

export function personKey(visit: Pick<SiteVisit, "email" | "firstName" | "lastName">) {
  const email = visit.email.trim().toLowerCase();
  if (email) return email;
  return `${visit.firstName.trim().toLowerCase()}|${visit.lastName.trim().toLowerCase()}`;
}

function normalizeVisit(raw: Partial<SiteVisit> | null | undefined, index = 0): SiteVisit | null {
  const firstName = String(raw?.firstName ?? "").trim();
  if (!firstName) return null;
  const kind = raw?.kind === "login" ? "login" : "visit";
  const at = String(raw?.at ?? "");
  const stamp = Number.isNaN(new Date(at).getTime()) ? new Date().toISOString() : at;
  return {
    id: String(raw?.id ?? `visit-${index}`),
    firstName,
    lastName: String(raw?.lastName ?? "").trim(),
    email: String(raw?.email ?? "").trim().toLowerCase(),
    at: stamp,
    kind,
  };
}

function normalizeStore(raw: unknown): VisitStore {
  const value = (raw ?? {}) as Partial<VisitStore>;
  const events = Array.isArray(value.events)
    ? value.events.map((event, index) => normalizeVisit(event, index)).filter((event): event is SiteVisit => Boolean(event))
    : [];
  return { events };
}

async function fromKv(): Promise<VisitStore | null> {
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

async function toKv(store: VisitStore) {
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

async function fromSupabase(): Promise<VisitStore | null> {
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

async function toSupabase(store: VisitStore) {
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

async function fromFile(): Promise<VisitStore | null> {
  try {
    const raw = await readFile(FILE, "utf8");
    return normalizeStore(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function toFile(store: VisitStore) {
  try {
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify(store, null, 2));
  } catch {
    // Vercel and similar hosts are read-only besides /tmp.
  }
}

export async function loadVisitStore(): Promise<VisitStore> {
  const cached = memory().store;
  if (cached) return cached;
  const store = (await fromKv()) ?? (await fromSupabase()) ?? (await fromFile()) ?? { ...EMPTY, events: [] };
  memory().store = store;
  return store;
}

async function saveVisitStore(store: VisitStore) {
  memory().store = store;
  await Promise.all([toKv(store), toSupabase(store), toFile(store)]);
}

export async function recordVisit(input: {
  firstName: string;
  lastName?: string;
  email?: string;
  kind: VisitKind;
}) {
  const nextEvent = normalizeVisit({
    id: `visit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    firstName: input.firstName,
    lastName: input.lastName ?? "",
    email: input.email ?? "",
    at: new Date().toISOString(),
    kind: input.kind,
  });
  if (!nextEvent) return loadVisitStore();

  const store = await loadVisitStore();
  const key = personKey(nextEvent);
  const latest = store.events.find((event) => personKey(event) === key);
  if (latest) {
    const age = Date.now() - new Date(latest.at).getTime();
    if (nextEvent.kind === "visit" && age < 10 * 60 * 1000) return store;
    if (nextEvent.kind === "login" && latest.kind === "login" && age < 60 * 1000) return store;
  }

  const events = [nextEvent, ...store.events].slice(0, MAX_EVENTS);
  const next = { events };
  await saveVisitStore(next);
  return next;
}

export async function resetVisitStore() {
  const next: VisitStore = { events: [] };
  memory().store = next;
  await saveVisitStore(next);
  return next;
}

export function summarizeVisitors(events: SiteVisit[]): VisitorSummary[] {
  const map = new Map<string, VisitorSummary>();
  for (const event of [...events].reverse()) {
    const key = personKey(event);
    const current = map.get(key);
    if (!current) {
      map.set(key, {
        key,
        firstName: event.firstName,
        lastName: event.lastName,
        email: event.email,
        firstSeen: event.at,
        lastSeen: event.at,
        logins: event.kind === "login" ? 1 : 0,
        visits: 1,
      });
      continue;
    }
    current.lastSeen = event.at;
    current.visits += 1;
    if (event.kind === "login") current.logins += 1;
    if (event.firstName) current.firstName = event.firstName;
    if (event.lastName) current.lastName = event.lastName;
    if (event.email) current.email = event.email;
  }
  return [...map.values()].sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));
}
