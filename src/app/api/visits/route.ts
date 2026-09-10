import { NextResponse } from "next/server";
import { getGateSession, hasAdminCookie } from "@/lib/gate/auth";
import { loadVisitStore, recordVisit, resetVisitStore, summarizeVisitors } from "@/lib/visits/store";

export async function GET() {
  if (!(await hasAdminCookie())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const store = await loadVisitStore();
  return NextResponse.json({
    events: store.events,
    visitors: summarizeVisitors(store.events),
  });
}

export async function POST(request: Request) {
  const session = await getGateSession();
  const admin = await hasAdminCookie();
  if (!session && !admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = (await request.json()) as {
    firstName?: string;
    lastName?: string;
    email?: string;
    kind?: "login" | "visit";
  };
  const firstName = body.firstName?.trim() || session?.firstName || "";
  if (!firstName) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const store = await recordVisit({
    firstName,
    lastName: body.lastName?.trim() || session?.lastName || "",
    email: body.email?.trim() || session?.email || "",
    kind: body.kind === "login" ? "login" : "visit",
  });
  return NextResponse.json({ ok: true, count: store.events.length });
}

export async function DELETE() {
  if (!(await hasAdminCookie())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await resetVisitStore();
  return NextResponse.json({ ok: true });
}
