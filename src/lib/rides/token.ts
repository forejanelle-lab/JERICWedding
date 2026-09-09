import { createHmac, timingSafeEqual } from "crypto";
import { GATE_PASSCODE } from "@/lib/gate/session";

function secret() {
  return process.env.GATE_SECRET ?? process.env.CRON_SECRET ?? `jeric-gate-${GATE_PASSCODE}`;
}

export function unsubscribeToken(email: string) {
  return createHmac("sha256", secret()).update(`ride-digest:${email.trim().toLowerCase()}`).digest("base64url");
}

export function unsubscribeUrl(origin: string, email: string) {
  const url = new URL("/unsubscribe", origin);
  url.searchParams.set("email", email.trim().toLowerCase());
  url.searchParams.set("token", unsubscribeToken(email));
  return url.toString();
}

export function verifyUnsubscribeToken(email: string, token: string) {
  const expected = unsubscribeToken(email);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
