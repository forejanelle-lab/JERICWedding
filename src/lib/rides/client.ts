import type { RideKind } from "@/lib/hub/types";

export async function queueRideDigest(input: {
  id: string;
  kind: RideKind;
  authorName: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  notes: string;
  emails: string[];
}) {
  try {
    await fetch("/api/rides/digest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    // Queueing is best-effort so posting a ride still works offline.
  }
}

export async function syncRideDigestEmails(emails: string[]) {
  if (!emails.length) return;
  try {
    await fetch("/api/rides/digest", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails }),
    });
  } catch {
    // ignore
  }
}

export async function requestRideDigestUnsubscribe(email: string) {
  const response = await fetch("/api/rides/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error("unsubscribe failed");
}
