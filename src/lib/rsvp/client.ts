import type { RsvpRecord } from "@/lib/hub/types";

export async function fetchSharedRsvps(): Promise<RsvpRecord[]> {
  try {
    const response = await fetch("/api/rsvp", { cache: "no-store" });
    if (!response.ok) return [];
    const data = (await response.json()) as { rsvps?: RsvpRecord[] };
    return Array.isArray(data.rsvps) ? data.rsvps : [];
  } catch {
    return [];
  }
}

export async function syncSharedRsvp(
  rsvp: Omit<RsvpRecord, "id" | "submittedAt"> &
    Partial<Pick<RsvpRecord, "id" | "submittedAt">> & {
      firstName?: string;
      lastName?: string;
      skipEmail?: boolean;
    },
): Promise<{ ok: boolean; rsvp: RsvpRecord | null }> {
  try {
    const response = await fetch("/api/rsvp/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rsvp),
    });
    if (!response.ok) {
      const body = await response.text();
      console.error("rsvp sync failed:", response.status, body);
      return { ok: false, rsvp: null };
    }
    const data = (await response.json()) as { error?: string | null; rsvp?: RsvpRecord; saved?: boolean };
    if (data.error) console.error("rsvp email failed:", data.error);
    return { ok: data.saved !== false, rsvp: data.rsvp ?? null };
  } catch (error) {
    console.error("rsvp confirmation request failed:", error);
    return { ok: false, rsvp: null };
  }
}
