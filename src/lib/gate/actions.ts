"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SEED_INVITES } from "@/lib/hub/seed";
import { GATE_COOKIE, GATE_PASSCODE, safeNextPath, type GateSession } from "@/lib/gate/session";

function findSeedInvite(email: string, firstName: string, lastName: string, inviteId: string) {
  if (inviteId) {
    const byId = SEED_INVITES.find((invite) => invite.id === inviteId);
    if (byId) return byId;
  }
  const mail = email.trim().toLowerCase();
  if (mail) {
    const byEmail = SEED_INVITES.find((invite) => invite.email.toLowerCase() === mail);
    if (byEmail) return byEmail;
  }
  const first = firstName.trim().toLowerCase();
  const last = lastName.trim().toLowerCase();
  if (!first) return null;
  return (
    SEED_INVITES.find(
      (invite) =>
        invite.firstName.toLowerCase() === first && (!last || invite.lastName.toLowerCase() === last),
    ) ?? null
  );
}

export async function enterWithEmail(formData: FormData) {
  const passcode = String(formData.get("passcode") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = safeNextPath(String(formData.get("next") ?? "/"));
  const clientFirst = String(formData.get("firstName") ?? "").trim();
  const clientLast = String(formData.get("lastName") ?? "").trim();
  const clientLocation = String(formData.get("location") ?? "").trim();
  const clientInviteId = String(formData.get("inviteId") ?? "").trim();
  const fromList = String(formData.get("fromList") ?? "") === "1";

  if (passcode !== GATE_PASSCODE) {
    return { error: "gate.error.passcode", field: "passcode" as const };
  }
  if (!clientFirst) {
    return { error: "gate.error.name" };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "gate.error.email" };
  }

  const seed = fromList ? findSeedInvite(email, clientFirst, clientLast, clientInviteId) : null;
  const session: GateSession = {
    firstName: clientFirst || seed?.firstName || "",
    lastName: seed?.lastName || clientLast,
    email,
    location: seed?.location || clientLocation,
    inviteId: fromList ? seed?.id || clientInviteId : "",
    enteredAt: new Date().toISOString(),
    fromList,
  };

  const store = await cookies();
  store.set(GATE_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });

  redirect(next);
}
