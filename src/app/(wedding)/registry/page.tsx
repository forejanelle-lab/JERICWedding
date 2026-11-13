"use client";

import { PageHeader, SectionWrap } from "@/components/site/PageHeader";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";

function registryHref(raw: string | undefined) {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

export default function RegistryPage() {
  const { t } = useI18n();
  const { state } = useHub();
  const href = registryHref(state.siteCopy["registry.url"]);
  return (
    <main className="pt-[calc(4.75rem+env(safe-area-inset-top))] md:pt-28">
      <SectionWrap className="bg-ivory">
        <PageHeader
          editId="registry"
          eyebrow="Truly"
          title="Your presence is the gift"
          description="Having you in Italy is what we want. For those who have asked, a small registry and honeymoon fund will live here."
        />
        {href ? (
          <div className="mt-12 flex justify-center">
            <a href={href} target="_blank" rel="noreferrer" className="btn-primary">
              {t("registry.view")}
            </a>
          </div>
        ) : null}
      </SectionWrap>
    </main>
  );
}
