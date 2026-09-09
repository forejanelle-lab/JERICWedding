"use server";

import { hasAdminCookie } from "@/lib/gate/auth";
import { sendDailyRideDigest } from "@/lib/rides/send";

export async function sendRideDigestNow() {
  if (!(await hasAdminCookie())) return { error: "admin" as const };
  try {
    const result = await sendDailyRideDigest();
    return { error: null, result };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "send-failed" };
  }
}
