import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { GATE_COOKIE, parseGateSession } from "@/lib/gate/session";
import { unsubscribeEmail } from "@/lib/rides/store";
import { verifyUnsubscribeToken } from "@/lib/rides/token";
import { normalizeEmail } from "@/lib/rides/emails";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; token?: string };
  const email = normalizeEmail(body.email ?? "");
  if (!email.includes("@")) {
    return NextResponse.json({ error: "email" }, { status: 400 });
  }

  const token = body.token?.trim() ?? "";
  if (token) {
    if (!verifyUnsubscribeToken(email, token)) {
      return NextResponse.json({ error: "token" }, { status: 400 });
    }
    await unsubscribeEmail(email);
    return NextResponse.json({ ok: true });
  }

  const jar = await cookies();
  const session = parseGateSession(jar.get(GATE_COOKIE)?.value);
  if (!session?.email || normalizeEmail(session.email) !== email) {
    return NextResponse.json({ error: "session" }, { status: 401 });
  }
  await unsubscribeEmail(email);
  return NextResponse.json({ ok: true });
}
