"use client";

import { canSeePage, isPageTemporarilyHidden } from "@/lib/hub/access";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function AccessGate({ href, children }: { href: string; children: React.ReactNode }) {
  const { state } = useHub();
  const { t } = useI18n();
  if (canSeePage(state, href)) return <>{children}</>;

  const hidden = isPageTemporarilyHidden(state, href);

  return (
    <main className="px-5 py-28">
      <div className="mx-auto max-w-lg text-center">
        <p className="font-script text-2xl italic text-taupe">
          {t(hidden ? "access.hidden.kicker" : "access.private.kicker")}
        </p>
        <h1 className="mt-3 font-serif text-3xl font-light tracking-[0.08em] uppercase">
          {t(hidden ? "access.hidden.title" : "access.private.title")}
        </h1>
        <p className="mt-4 font-sans text-sm text-charcoal/70">
          {t(hidden ? "access.hidden.body" : "access.private.body")}
        </p>
      </div>
    </main>
  );
}
