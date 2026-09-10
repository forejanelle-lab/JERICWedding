import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { DEFAULT_GUEST_TAGS } from "@/lib/hub/access";
import type { EventId, InviteRecord } from "@/lib/hub/types";

export type InviteStore = {
  invites: InviteRecord[];
};

const EMPTY: InviteStore = { invites: [] };
const FILE = path.join(process.cwd(), ".data", "invites.json");
const KV_KEY = "jeric-invites";
const SUPABASE_ROW = "invites";
const ALL_EVENTS: EventId[] = ["welcome", "ceremony", "reception", "brunch"];

type GlobalInvites = { store?: InviteStore };

function memory() {
  const global = globalThis as typeof globalThis & { __jericInvites?: GlobalInvites };
  if (!global.__jericInvites) global.__jericInvites = {};
  return global.__jericInvites;
}

export function normalizeInvite(raw: Partial<InviteRecord> | null | undefined, index = 0): InviteRecord | null {
  const firstName = String(raw?.firstName ?? "").trim();
  const lastName = String(raw?.lastName ?? "").trim();
  if (!firstName && !lastName) return null;
  const events = Array.isArray(raw?.events)
    ? raw.events.filter((item): item is EventId => ALL_EVENTS.includes(item as EventId))
    : ALL_EVENTS;
  return {
    id: String(raw?.id ?? `inv-${index}`),
    firstName: firstName || "Guest",
    lastName,
    email: String(raw?.email ?? "").trim(),
    location: String(raw?.location ?? "").trim(),
    inItaly: Boolean(raw?.inItaly),
    party: Array.isArray(raw?.party) ? raw.party.map((name) => String(name).trim()).filter(Boolean) : [],
    events: events.length ? events : ALL_EVENTS,
    tags: Array.isArray(raw?.tags) && raw.tags.length ? raw.tags.map(String) : [...DEFAULT_GUEST_TAGS],
    invited: raw?.invited !== false,
    entered: Boolean(raw?.entered),
    canEditSite: Boolean(raw?.canEditSite),
  };
}

function normalizeStore(raw: unknown): InviteStore {
  const value = (raw ?? {}) as Partial<InviteStore>;
  const invites = Array.isArray(value.invites)
    ? value.invites.map((invite, index) => normalizeInvite(invite, index)).filter((invite): invite is InviteRecord => Boolean(invite))
    : [];
  return { invites };
}

async function fromKv(): Promise<InviteStore | null> {
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

async function toKv(store: InviteStore) {
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

async function fromSupabase(): Promise<InviteStore | null> {
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

async function toSupabase(store: InviteStore) {
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

async function fromFile(): Promise<InviteStore | null> {
  try {
    const raw = await readFile(FILE, "utf8");
    return normalizeStore(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function toFile(store: InviteStore) {
  try {
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify(store, null, 2));
  } catch {
    // Vercel and similar hosts are read-only besides /tmp.
  }
}

export async function loadInviteStore(): Promise<InviteStore> {
  const cached = memory().store;
  if (cached) return cached;
  const store = (await fromKv()) ?? (await fromSupabase()) ?? (await fromFile()) ?? { ...EMPTY, invites: [] };
  memory().store = store;
  return store;
}

async function saveInviteStore(store: InviteStore) {
  memory().store = store;
  await Promise.all([toKv(store), toSupabase(store), toFile(store)]);
}

export async function replaceInvites(invites: InviteRecord[]) {
  const next = normalizeStore({ invites });
  await saveInviteStore(next);
  return next;
}

export function findStoredInvite(
  invites: InviteRecord[],
  input: { email?: string; firstName?: string; lastName?: string; inviteId?: string },
) {
  const inviteId = input.inviteId?.trim() ?? "";
  if (inviteId) {
    const byId = invites.find((invite) => invite.id === inviteId);
    if (byId) return byId;
  }
  const email = input.email?.trim().toLowerCase() ?? "";
  if (email) {
    const byEmail = invites.find((invite) => invite.email.trim().toLowerCase() === email);
    if (byEmail) return byEmail;
  }
  const first = input.firstName?.trim().toLowerCase() ?? "";
  const last = input.lastName?.trim().toLowerCase() ?? "";
  if (!first) return null;
  return (
    invites.find(
      (invite) =>
        invite.firstName.trim().toLowerCase() === first &&
        (!last || invite.lastName.trim().toLowerCase() === last),
    ) ?? null
  );
}

export async function resetInviteStore() {
  const next: InviteStore = { invites: [] };
  memory().store = next;
  await saveInviteStore(next);
  return next;
}
