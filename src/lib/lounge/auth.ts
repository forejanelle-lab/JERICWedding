import { cookies } from "next/headers";
import { LOUNGE_SESSION_COOKIE, type LoungeSession } from "@/lib/lounge/session";

export { LOUNGE_SESSION_COOKIE, getInvitationCode } from "@/lib/lounge/session";
export type { LoungeSession } from "@/lib/lounge/session";

export async function getLoungeSession(): Promise<LoungeSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOUNGE_SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as LoungeSession;
  } catch {
    return null;
  }
}

export async function isLoungeAuthenticated(): Promise<boolean> {
  const session = await getLoungeSession();
  return Boolean(session?.guestName);
}
