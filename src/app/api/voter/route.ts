import { createHash } from "crypto";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  const voterId = createHash("sha256").update(`jeric-song:${ip}`).digest("hex").slice(0, 24);
  return NextResponse.json({ voterId });
}
