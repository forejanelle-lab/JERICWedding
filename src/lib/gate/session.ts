export const GATE_COOKIE = "jeric_gate_v2";
export const ADMIN_COOKIE = "jeric_admin";
export const GATE_PASSCODE = "JERIC";

export type GateSession = {
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  inviteId: string;
  enteredAt: string;
  fromList: boolean;
};

export function parseGateSession(raw: string | undefined): GateSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<GateSession>;
    if (!parsed.firstName) return null;
    return {
      firstName: parsed.firstName,
      lastName: parsed.lastName ?? "",
      email: parsed.email ?? "",
      location: parsed.location ?? "",
      inviteId: parsed.inviteId ?? "",
      enteredAt: parsed.enteredAt ?? "",
      fromList: parsed.fromList !== false && Boolean(parsed.inviteId),
    };
  } catch {
    return null;
  }
}

export function safeNextPath(raw: string | null | undefined) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return "/";
  }
  return raw;
}
