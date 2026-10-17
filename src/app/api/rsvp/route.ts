import { NextResponse } from "next/server";
import { hasAdminCookie } from "@/lib/gate/auth";
import { loadRsvpStore, removeRsvp, resetRsvpStore } from "@/lib/rsvp/store";

export async function GET() {
  const store = await loadRsvpStore();
  return NextResponse.json({ rsvps: store.rsvps });
}

export async function DELETE(request: Request) {
  if (!(await hasAdminCookie())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (id) {
    const store = await removeRsvp(id);
    return NextResponse.json({ ok: true, count: store.rsvps.length });
  }
  await resetRsvpStore();
  return NextResponse.json({ ok: true });
}
