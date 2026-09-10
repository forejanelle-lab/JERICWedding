import { NextResponse } from "next/server";
import { isCoupleAdmin } from "@/lib/hub/content";
import { getGateSession, hasAdminCookie } from "@/lib/gate/auth";
import { personIsSiteEditor } from "@/lib/editors/store";
import { loadSiteContent, replaceSiteContent, resetSiteContent } from "@/lib/site-content/store";
import type { SiteContent } from "@/lib/site-content/types";

async function canPublishSite() {
  if (await hasAdminCookie()) return true;
  const session = await getGateSession();
  if (!session) return false;
  if (isCoupleAdmin(session.firstName, session.email)) return true;
  return personIsSiteEditor({
    email: session.email,
    firstName: session.firstName,
    lastName: session.lastName,
  });
}

export async function GET() {
  const content = await loadSiteContent();
  return NextResponse.json(content);
}

export async function POST(request: Request) {
  if (!(await canPublishSite())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = (await request.json()) as Partial<SiteContent>;
  await replaceSiteContent({
    siteCopy: body.siteCopy ?? {},
    siteImages: body.siteImages ?? {},
    siteHidden: body.siteHidden ?? [],
    hiddenPages: body.hiddenPages ?? [],
    heroImage: body.heroImage ?? "/images/casale-bosco.jpg",
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  if (!(await hasAdminCookie())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await resetSiteContent();
  return NextResponse.json({ ok: true });
}
