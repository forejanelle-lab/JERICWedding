"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GATE_COOKIE, GATE_PASSCODE, safeNextPath, type GateSession } from "@/lib/gate/session";
import { findStoredInvite, loadInviteStore } from "@/lib/invites/store";
import { recordVisit } from "@/lib/visits/store";

export async function enterWithEmail(formData: FormData) {
  const passcode = String(formData.get("passcode") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = safeNextPath(String(formData.get("next") ?? "/"));
  const enteredName = String(formData.get("name") ?? "").trim();
  const nameParts = enteredName.split(/\s+/).filter(Boolean);
  const clientFirst = String(formData.get("firstName") ?? "").trim() || nameParts[0] || "";
  const clientLast = String(formData.get("lastName") ?? "").trim() || nameParts.slice(1).join(" ");
  const clientLocation = String(formData.get("location") ?? "").trim();
  const clientInviteId = String(formData.get("inviteId") ?? "").trim();

  if (passcode !== GATE_PASSCODE) {
    return { error: "gate.error.passcode", field: "passcode" as const };
  }
  if (!clientFirst) {
    return { error: "gate.error.name" };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "gate.error.email" };
  }

  const { invites } = await loadInviteStore();
  const matched = findStoredInvite(invites, {
    email,
    firstName: clientFirst,
    lastName: clientLast,
    inviteId: clientInviteId,
  });

  const session: GateSession = {
    firstName: clientFirst || matched?.firstName || "",
    lastName: clientLast || matched?.lastName || "",
    email: email || matched?.email || "",
    location: clientLocation || matched?.location || "",
    inviteId: clientInviteId || matched?.id || "",
    enteredAt: new Date().toISOString(),
    fromList: Boolean(clientInviteId || matched),
  };

  const store = await cookies();
  store.set(GATE_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });

  await recordVisit({
    firstName: session.firstName,
    lastName: session.lastName,
    email: session.email,
    kind: "login",
  });

  redirect(next);
}
