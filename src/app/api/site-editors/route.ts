import { NextResponse } from "next/server";
import { isListedEditor, normalizeEditor, type SiteEditor } from "@/lib/editors/match";
import { loadEditorStore, personIsSiteEditor, replaceEditors, resetEditorStore } from "@/lib/editors/store";
import { getGateSession, hasAdminCookie } from "@/lib/gate/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") ?? "";
  const firstName = searchParams.get("firstName") ?? "";
  const lastName = searchParams.get("lastName") ?? "";
  const admin = await hasAdminCookie();
  const store = await loadEditorStore();

  if (admin && !email && !firstName) {
    return NextResponse.json({ editors: store.editors });
  }

  const session = await getGateSession();
  const person = {
    email: email || session?.email || "",
    firstName: firstName || session?.firstName || "",
    lastName: lastName || session?.lastName || "",
  };
  return NextResponse.json({
    editor: isListedEditor(person, store.editors),
  });
}

export async function POST(request: Request) {
  if (!(await hasAdminCookie())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = (await request.json()) as { editors?: SiteEditor[] };
  const editors = Array.isArray(body.editors) ? body.editors.map(normalizeEditor) : [];
  await replaceEditors(editors);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  if (!(await hasAdminCookie())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await resetEditorStore();
  return NextResponse.json({ ok: true });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  const editor = await personIsSiteEditor(body);
  return NextResponse.json({ editor });
}
