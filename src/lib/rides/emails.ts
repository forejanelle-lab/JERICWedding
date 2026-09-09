import type { HubState } from "@/lib/hub/types";

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isUsableEmail(value: string) {
  const email = normalizeEmail(value);
  if (!email.includes("@") || email.length < 5) return false;
  if (email.endsWith("@example.com") && process.env.DIGEST_ALLOW_EXAMPLE !== "1") return false;
  return true;
}

export function collectHubEmails(state: Pick<HubState, "invites" | "guests" | "rsvps" | "identity">) {
  const emails = new Set<string>();
  for (const invite of state.invites) {
    if (invite.email) emails.add(normalizeEmail(invite.email));
  }
  for (const guest of state.guests) {
    if (guest.email) emails.add(normalizeEmail(guest.email));
  }
  for (const rsvp of state.rsvps) {
    if (rsvp.email) emails.add(normalizeEmail(rsvp.email));
  }
  if (state.identity?.email) emails.add(normalizeEmail(state.identity.email));
  return [...emails].filter(isUsableEmail);
}
