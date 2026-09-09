"use client";

import { PageHeader, SectionWrap } from "@/components/site/PageHeader";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function RegistryPage() {
  const { t } = useI18n();
  return (
    <main className="pt-[calc(4.75rem+env(safe-area-inset-top))] md:pt-28">
      <SectionWrap className="bg-ivory">
        <PageHeader
          editId="registry"
          eyebrow="Truly"
          title="Your presence is the gift"
          description="Having you in Italy is what we want. For those who have asked, a small registry and honeymoon fund will live here."
        />
        <div className="mt-12 flex justify-center">
          <a href="#" className="btn-primary">
            {t("registry.view")}
          </a>
        </div>
      </SectionWrap>
    </main>
  );
}
