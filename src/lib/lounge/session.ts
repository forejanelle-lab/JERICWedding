export const LOUNGE_SESSION_COOKIE = "lounge_session";

export type LoungeSession = {
  guestName: string;
  email?: string;
  verifiedAt: string;
};

/** Shared code for all invited guests — not tied to a specific name yet. */
export const DEFAULT_INVITATION_CODE = "JF2027";

/** Demo defaults for the login form (dev / first visit). */
export const DEMO_LOGIN = {
  invitationCode: DEFAULT_INVITATION_CODE,
  guestName: "Janelle",
} as const;

export function getInvitationCode() {
  return process.env.LOUNGE_INVITATION_CODE ?? DEFAULT_INVITATION_CODE;
}
