"use server";

import { cookies } from "next/headers";
import { ADMIN_COOKIE, GATE_COOKIE } from "@/lib/gate/session";

export async function setAdminCookie() {
  const store = await cookies();
  store.set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function clearGateCookie() {
  const store = await cookies();
  store.delete(GATE_COOKIE);
}
