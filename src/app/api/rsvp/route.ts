import { NextResponse } from "next/server";
import { hasAdminCookie } from "@/lib/gate/auth";
import { loadRsvpStore, resetRsvpStore } from "@/lib/rsvp/store";

export async function GET() {
  const store = await loadRsvpStore();
  return NextResponse.json({ rsvps: store.rsvps });
}

export async function DELETE() {
  if (!(await hasAdminCookie())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await resetRsvpStore();
  return NextResponse.json({ ok: true });
}
