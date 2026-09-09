import { cookies } from "next/headers";
import { ADMIN_COOKIE, GATE_COOKIE, parseGateSession, type GateSession } from "@/lib/gate/session";

export async function getGateSession(): Promise<GateSession | null> {
  const store = await cookies();
  return parseGateSession(store.get(GATE_COOKIE)?.value);
}

export async function hasAdminCookie() {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === "1";
}
