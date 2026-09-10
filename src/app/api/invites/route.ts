import { NextResponse } from "next/server";
import { hasAdminCookie } from "@/lib/gate/auth";
import type { InviteRecord } from "@/lib/hub/types";
import { loadInviteStore, replaceInvites, resetInviteStore } from "@/lib/invites/store";

export async function GET() {
  const store = await loadInviteStore();
  return NextResponse.json({ invites: store.invites });
}

export async function POST(request: Request) {
  if (!(await hasAdminCookie())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = (await request.json()) as { invites?: InviteRecord[] };
  const invites = Array.isArray(body.invites) ? body.invites : [];
  await replaceInvites(invites);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  if (!(await hasAdminCookie())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await resetInviteStore();
  return NextResponse.json({ ok: true });
}
