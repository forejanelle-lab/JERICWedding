import { NextResponse } from "next/server";
import { hasAdminCookie } from "@/lib/gate/auth";
import { loadSiteContent, replaceSiteContent, resetSiteContent } from "@/lib/site-content/store";
import type { SiteContent } from "@/lib/site-content/types";

export async function GET() {
  const content = await loadSiteContent();
  return NextResponse.json(content);
}

export async function POST(request: Request) {
  if (!(await hasAdminCookie())) {
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
