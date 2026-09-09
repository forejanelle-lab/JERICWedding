import { NextResponse } from "next/server";
import { queueDigestPost, syncDigestEmails } from "@/lib/rides/store";
import type { RideKind } from "@/lib/hub/types";

type QueueBody = {
  id?: string;
  kind?: RideKind;
  authorName?: string;
  from?: string;
  to?: string;
  date?: string;
  time?: string;
  seats?: number;
  notes?: string;
  emails?: string[];
};

export async function POST(request: Request) {
  const body = (await request.json()) as QueueBody;
  if (!body.id || (body.kind !== "offer" && body.kind !== "request") || !body.from || !body.to) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  await queueDigestPost({
    post: {
      id: body.id,
      kind: body.kind,
      authorName: body.authorName?.trim() || "Guest",
      from: body.from,
      to: body.to,
      date: body.date ?? "",
      time: body.time ?? "",
      seats: Number(body.seats) || 0,
      notes: body.notes ?? "",
    },
    emails: Array.isArray(body.emails) ? body.emails : [],
  });
  return NextResponse.json({ ok: true });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { emails?: string[] };
  await syncDigestEmails(Array.isArray(body.emails) ? body.emails : []);
  return NextResponse.json({ ok: true });
}
