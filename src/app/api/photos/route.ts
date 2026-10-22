import { NextResponse } from "next/server";
import { getGateSession, hasAdminCookie } from "@/lib/gate/auth";
import type { GuestPhoto } from "@/lib/hub/types";
import { loadPhotos, removePhoto, upsertPhoto } from "@/lib/photos/store";

export const dynamic = "force-dynamic";

async function canWrite() {
  if (await hasAdminCookie()) return true;
  return Boolean(await getGateSession());
}

export async function GET() {
  const photos = await loadPhotos();
  return NextResponse.json({ photos });
}

export async function POST(request: Request) {
  if (!(await canWrite())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as { photo?: GuestPhoto };
  if (!body.photo?.id || !body.photo.src) {
    return NextResponse.json({ error: "A photo is required." }, { status: 400 });
  }
  const photos = await upsertPhoto(body.photo);
  return NextResponse.json({ ok: true, photos });
}

export async function DELETE(request: Request) {
  if (!(await canWrite())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
  if (!id) return NextResponse.json({ error: "Missing photo." }, { status: 400 });
  const photos = await removePhoto(id);
  return NextResponse.json({ ok: true, photos });
}
