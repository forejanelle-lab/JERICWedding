"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Footer } from "@/components/Footer";
import { AccessGate } from "@/components/site/AccessGate";
import { AdminBar } from "@/components/site/AdminBar";
import { LanguageSelect } from "@/components/site/LanguageSelect";
import { MobileTabBar, SiteNav } from "@/components/site/SiteNav";

export function SiteChrome({
  children,
  unlocked = true,
}: {
  children: React.ReactNode;
  unlocked?: boolean;
}) {
  return (
    <Suspense fallback={<div className="min-h-full">{children}</div>}>
      <SiteChromeInner unlocked={unlocked}>{children}</SiteChromeInner>
    </Suspense>
  );
}

function SiteChromeInner({
  children,
  unlocked,
}: {
  children: React.ReactNode;
  unlocked: boolean;
}) {
  const pathname = usePathname();
  const search = useSearchParams();
  const home = pathname === "/";
  const gateView = home && search.get("view") === "gate";

  if (!unlocked || gateView) {
    return (
      <>
        <div className="fixed right-4 top-3 z-[60]">
          <LanguageSelect tone="light" />
        </div>
        <AdminBar />
        <div className="min-h-full">{children}</div>
      </>
    );
  }

  return (
    <>
      <SiteNav />
      <AdminBar />
      <div className="min-h-full pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-0">
        <AccessGate href={pathname}>{children}</AccessGate>
      </div>
      {home ? null : <Footer />}
      <MobileTabBar />
    </>
  );
}
