import { createHmac, timingSafeEqual } from "crypto";
import { GATE_PASSCODE } from "@/lib/gate/session";

const SECRET = process.env.GATE_SECRET ?? `jeric-gate-${GATE_PASSCODE}`;
const TTL_MS = 30 * 60 * 1000;

export type MagicPayload = {
  email: string;
  inviteId: string;
  firstName: string;
  lastName: string;
  location: string;
  exp: number;
};

export function signMagicToken(payload: Omit<MagicPayload, "exp">) {
  const full: MagicPayload = { ...payload, exp: Date.now() + TTL_MS };
  const body = Buffer.from(JSON.stringify(full)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyMagicToken(token: string): MagicPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", SECRET).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as MagicPayload;
    if (!payload.email || !payload.firstName || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
