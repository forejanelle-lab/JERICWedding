import type { InviteRecord } from "@/lib/hub/types";

export async function fetchSharedInvites(): Promise<InviteRecord[]> {
  try {
    const response = await fetch("/api/invites", { cache: "no-store" });
    if (!response.ok) return [];
    const data = (await response.json()) as { invites?: InviteRecord[] };
    return Array.isArray(data.invites) ? data.invites : [];
  } catch {
    return [];
  }
}

export async function syncSharedInvites(invites: InviteRecord[]) {
  try {
    await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invites }),
    });
  } catch {
    // Keep the local guest list even if the shared list is unavailable.
  }
}
