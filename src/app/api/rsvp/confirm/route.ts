import { NextResponse } from "next/server";
import { syncRsvpToBrevo } from "@/lib/brevo/rsvp";
import { getGateSession, hasAdminCookie } from "@/lib/gate/auth";

export async function POST(request: Request) {
  const session = await getGateSession();
  const admin = await hasAdminCookie();
  if (!session && !admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    attending?: boolean;
    email?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  };

  const attending = body.attending === true;
  const email = body.email?.trim() || session?.email?.trim() || "";
  const fullName = body.name?.trim() || "";
  const firstName = body.firstName?.trim() || session?.firstName?.trim() || "";
  const lastName = body.lastName?.trim() || session?.lastName?.trim() || "";

  const result = await syncRsvpToBrevo({
    attending,
    email,
    firstName,
    lastName,
    fullName,
  });

  if (!result.synced || !result.sent) {
    console.error("rsvp Brevo confirm failed:", result.error);
  }

  return NextResponse.json({
    ok: result.synced && result.sent,
    synced: result.synced,
    sent: result.sent,
    error: result.error ?? null,
  });
}
