import { NextResponse } from "next/server";
import { syncRsvpToBrevo } from "@/lib/brevo/rsvp";
import { getGateSession, hasAdminCookie } from "@/lib/gate/auth";
import type { EventId, RsvpRecord, StayArea } from "@/lib/hub/types";
import { upsertRsvp } from "@/lib/rsvp/store";

export async function POST(request: Request) {
  const session = await getGateSession();
  const admin = await hasAdminCookie();
  if (!session && !admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as Partial<RsvpRecord> & {
    firstName?: string;
    lastName?: string;
  };

  const name =
    body.name?.trim() ||
    [body.firstName, body.lastName].filter(Boolean).join(" ").trim() ||
    [session?.firstName, session?.lastName].filter(Boolean).join(" ").trim();
  const email = body.email?.trim() || session?.email?.trim() || "";
  const firstName = body.firstName?.trim() || session?.firstName?.trim() || name.split(/\s+/)[0] || "";
  const lastName =
    body.lastName?.trim() || session?.lastName?.trim() || name.split(/\s+/).slice(1).join(" ");

  if (!name) {
    return NextResponse.json({ error: "A name is required." }, { status: 400 });
  }

  const attending = body.attending === true;
  const store = await upsertRsvp({
    id: body.id,
    name,
    email,
    attending,
    events: attending && Array.isArray(body.events) ? (body.events as EventId[]) : [],
    guestCount: body.guestCount,
    dietary: body.dietary,
    song: body.song,
    airport: body.airport,
    arrivalDate: body.arrivalDate,
    arrivalTime: body.arrivalTime,
    departureDate: body.departureDate,
    departureTime: body.departureTime,
    stay: body.stay as StayArea | "",
    inviteId: body.inviteId,
    partyAttending: body.partyAttending,
    submittedAt: body.submittedAt,
  });

  const result = await syncRsvpToBrevo({
    attending,
    email,
    firstName,
    lastName,
    fullName: name,
  });

  if (!result.synced || !result.sent || !result.notified) {
    console.error("rsvp Brevo confirm failed:", result.error);
  }

  return NextResponse.json({
    ok: true,
    saved: true,
    count: store.rsvps.length,
    synced: result.synced,
    sent: result.sent,
    notified: result.notified,
    error: result.error ?? null,
  });
}
