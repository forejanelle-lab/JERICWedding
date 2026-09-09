"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getInvitationCode,
  LOUNGE_SESSION_COOKIE,
  type LoungeSession,
} from "@/lib/lounge/session";

export async function enterLounge(formData: FormData) {
  const code = String(formData.get("invitation_code") ?? "").trim();
  const guestName = String(formData.get("guest_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || undefined;

  if (!code) {
    return { error: "Please enter your invitation code." };
  }

  if (code.toUpperCase() !== getInvitationCode().toUpperCase()) {
    return { error: "That invitation code isn't recognized. Check your invite email." };
  }

  if (!guestName) {
    return { error: "Please enter your name so other guests can recognize you." };
  }

  const session: LoungeSession = {
    guestName,
    email,
    verifiedAt: new Date().toISOString(),
  };

  const cookieStore = await cookies();
  cookieStore.set(LOUNGE_SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });

  redirect("/lounge");
}

export async function leaveLounge() {
  const cookieStore = await cookies();
  cookieStore.delete(LOUNGE_SESSION_COOKIE);
  redirect("/lounge/login");
}
