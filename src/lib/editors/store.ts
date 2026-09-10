import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { isListedEditor, normalizeEditor, type SiteEditor } from "@/lib/editors/match";

export type EditorStore = {
  editors: SiteEditor[];
};

const EMPTY: EditorStore = { editors: [] };
const FILE = path.join(process.cwd(), ".data", "site-editors.json");
const KV_KEY = "jeric-site-editors";
const SUPABASE_ROW = "editors";

type GlobalEditors = { store?: EditorStore };

function memory() {
  const global = globalThis as typeof globalThis & { __jericSiteEditors?: GlobalEditors };
  if (!global.__jericSiteEditors) global.__jericSiteEditors = {};
  return global.__jericSiteEditors;
}

function normalizeStore(raw: unknown): EditorStore {
  const value = (raw ?? {}) as Partial<EditorStore>;
  const editors = Array.isArray(value.editors)
    ? value.editors.map((editor) => normalizeEditor(editor)).filter((editor) => editor.email || editor.firstName)
    : [];
  return { editors };
}

async function fromKv(): Promise<EditorStore | null> {
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

async function toKv(store: EditorStore) {
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

async function fromSupabase(): Promise<EditorStore | null> {
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

async function toSupabase(store: EditorStore) {
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

async function fromFile(): Promise<EditorStore | null> {
  try {
    const raw = await readFile(FILE, "utf8");
    return normalizeStore(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function toFile(store: EditorStore) {
  try {
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify(store, null, 2));
  } catch {
    // Vercel and similar hosts are read-only besides /tmp.
  }
}

export async function loadEditorStore(): Promise<EditorStore> {
  const cached = memory().store;
  if (cached) return cached;
  const store = (await fromKv()) ?? (await fromSupabase()) ?? (await fromFile()) ?? { ...EMPTY, editors: [] };
  memory().store = store;
  return store;
}

async function saveEditorStore(store: EditorStore) {
  memory().store = store;
  await Promise.all([toKv(store), toSupabase(store), toFile(store)]);
}

export async function replaceEditors(editors: SiteEditor[]) {
  const next = normalizeStore({ editors });
  await saveEditorStore(next);
  return next;
}

export async function personIsSiteEditor(person: {
  email?: string;
  firstName?: string;
  lastName?: string;
}) {
  const store = await loadEditorStore();
  return isListedEditor(person, store.editors);
}

export async function resetEditorStore() {
  const next: EditorStore = { editors: [] };
  memory().store = next;
  await saveEditorStore(next);
  return next;
}
