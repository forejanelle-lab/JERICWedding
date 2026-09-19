import type { RsvpRecord } from "@/lib/hub/types";

export function rsvpIdentityKey(rsvp: Pick<RsvpRecord, "email" | "name" | "inviteId">) {
  const email = rsvp.email.trim().toLowerCase();
  if (email) return `email:${email}`;
  return `name:${rsvp.name.trim().toLowerCase()}|${rsvp.inviteId.trim().toLowerCase()}`;
}

export function mergeRsvpLists(local: RsvpRecord[], remote: RsvpRecord[]) {
  const byId = new Map<string, RsvpRecord>();
  const seen = new Set<string>();
  for (const rsvp of [...remote, ...local]) {
    if (!rsvp?.id || !rsvp.name?.trim()) continue;
    const key = rsvpIdentityKey(rsvp);
    if (byId.has(rsvp.id) || seen.has(key)) continue;
    byId.set(rsvp.id, rsvp);
    seen.add(key);
  }
  return [...byId.values()].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}
