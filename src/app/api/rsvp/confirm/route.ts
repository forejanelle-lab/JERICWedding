import { NextResponse } from "next/server";
import { DEFAULT_GUEST_TAGS } from "@/lib/hub/access";
import { syncRsvpToBrevo } from "@/lib/brevo/rsvp";
import { getGateSession, hasAdminCookie } from "@/lib/gate/auth";
import type { EventId, RsvpRecord, StayArea } from "@/lib/hub/types";
import { findStoredInvite, loadInviteStore, upsertStoredInvite } from "@/lib/invites/store";
import { upsertRsvp } from "@/lib/rsvp/store";

export async function POST(request: Request) {
  const session = await getGateSession();
  const admin = await hasAdminCookie();
  if (!session && !admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
  const body = (await request.json().catch(() => ({}))) as Partial<RsvpRecord> & {
    firstName?: string;
    lastName?: string;
    skipEmail?: boolean;
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
  const events = attending && Array.isArray(body.events) ? (body.events as EventId[]) : [];
  const partyAttending = Array.isArray(body.partyAttending)
    ? body.partyAttending.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const inviteIdRaw = String(body.inviteId ?? "").trim();
  const { invites } = await loadInviteStore();
  const existing = findStoredInvite(invites, {
    inviteId: inviteIdRaw.startsWith("new-") ? "" : inviteIdRaw,
    email,
    firstName,
    lastName,
  });
  const inviteId = existing?.id || (inviteIdRaw.startsWith("new-") ? "" : inviteIdRaw) || `inv-${Date.now().toString(36)}`;

  if (!existing) {
    await upsertStoredInvite({
      id: inviteId,
      firstName,
      lastName,
      email,
      location: "",
      inItaly: false,
      party: partyAttending.filter((item) => item.toLowerCase() !== name.toLowerCase()),
      events: events.length ? events : ["welcome", "ceremony", "reception", "brunch"],
      tags: [...DEFAULT_GUEST_TAGS],
      invited: true,
      entered: true,
    });
  }

  const store = await upsertRsvp({
    id: body.id,
    name,
    email,
    attending,
    events,
    guestCount: body.guestCount,
    dietary: body.dietary,
    song: body.song,
    airport: body.airport,
    arrivalDate: body.arrivalDate,
    arrivalTime: body.arrivalTime,
    departureDate: body.departureDate,
    departureTime: body.departureTime,
    stay: body.stay as StayArea | "",
    inviteId,
    partyAttending,
    submittedAt: body.submittedAt,
  });
  const rsvp = store.rsvps[0] ?? null;

  if (body.skipEmail) {
    return NextResponse.json({
      ok: true,
      saved: true,
      rsvp,
      inviteId,
      count: store.rsvps.length,
      synced: false,
      sent: false,
      notified: false,
      error: null,
    });
  }

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
    rsvp,
    inviteId,
    count: store.rsvps.length,
    synced: result.synced,
    sent: result.sent,
    notified: result.notified,
    error: result.error ?? null,
  });
  } catch (error) {
    console.error("rsvp confirm failed:", error);
    return NextResponse.json({ error: "We couldn't save your RSVP." }, { status: 500 });
  }
}
