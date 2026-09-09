import { NextResponse, type NextRequest } from "next/server";
import { sendDailyRideDigest } from "@/lib/rides/send";
import { GATE_PASSCODE } from "@/lib/gate/session";

function authorized(request: NextRequest) {
  const expected = process.env.CRON_SECRET ?? process.env.GATE_SECRET ?? GATE_PASSCODE;
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const query = request.nextUrl.searchParams.get("secret") ?? "";
  return bearer === expected || query === expected;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await sendDailyRideDigest();
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await sendDailyRideDigest();
  return NextResponse.json(result);
}
