"use client";

import Link from "next/link";
import { canEditWebsite, canSeePage, isPageTemporarilyHidden } from "@/lib/hub/access";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function AccessGate({ href, children }: { href: string; children: React.ReactNode }) {
  const { state } = useHub();
  const { t } = useI18n();
  const hidden = isPageTemporarilyHidden(state, href) && !canEditWebsite(state);

  if (hidden) {
    return (
      <main className="px-5 py-28">
        <div className="mx-auto max-w-lg text-center">
          <p className="font-script text-2xl italic text-taupe">{t("access.hidden.kicker")}</p>
          <h1 className="mt-3 font-serif text-3xl font-light tracking-[0.08em] uppercase">
            {t("access.hidden.title")}
          </h1>
          <p className="mt-4 font-sans text-sm text-charcoal/70">{t("access.hidden.body")}</p>
          <Link href="/" className="btn-primary mt-8 inline-flex min-h-12">
            {t("access.hidden.cta")}
          </Link>
        </div>
      </main>
    );
  }

  if (!canSeePage(state, href)) {
    return (
      <main className="px-5 py-28">
        <div className="mx-auto max-w-lg text-center">
          <p className="font-script text-2xl italic text-taupe">{t("access.private.kicker")}</p>
          <h1 className="mt-3 font-serif text-3xl font-light tracking-[0.08em] uppercase">
            {t("access.private.title")}
          </h1>
          <p className="mt-4 font-sans text-sm text-charcoal/70">{t("access.private.body")}</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
