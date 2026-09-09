import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, safeNextPath, type GateSession } from "@/lib/gate/session";
import { verifyMagicToken } from "@/lib/gate/token";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const payload = verifyMagicToken(token);

  if (!payload) {
    const failed = request.nextUrl.clone();
    failed.pathname = "/";
    failed.search = "";
    failed.searchParams.set("error", "link");
    return NextResponse.redirect(failed);
  }

  const session: GateSession = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    location: payload.location,
    inviteId: payload.inviteId,
    enteredAt: new Date().toISOString(),
    fromList: Boolean(payload.inviteId),
  };

  const destination = new URL(next, request.url);
  const response = NextResponse.redirect(destination);
  response.cookies.set(GATE_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  return response;
}
