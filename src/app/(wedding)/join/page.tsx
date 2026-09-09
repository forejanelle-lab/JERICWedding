"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OPTIONAL_GUEST_CODE } from "@/lib/hub/content";
import { PageHeader, SectionWrap } from "@/components/site/PageHeader";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { readImageAsCompressedDataUrl } from "@/lib/hub/utils";
import type { Side } from "@/lib/hub/types";

export default function JoinPage() {
  return (
    <Suspense fallback={<main className="pt-28" />}>
      <JoinForm />
    </Suspense>
  );
}

function JoinForm() {
  const { join, state } = useHub();
  const { t } = useI18n();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/me";
  const [step, setStep] = useState<"form" | "link" | "done">(state.identity ? "done" : "form");
  const [pending, setPending] = useState<Parameters<typeof join>[0] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (state.identity) setStep("done");
  }, [state.identity]);

  if (step === "done" && state.identity) {
    return (
      <main className="pt-[calc(4.75rem+env(safe-area-inset-top))] md:pt-28">
        <SectionWrap>
          <PageHeader
            eyebrow="You're in"
            title={`Welcome, ${state.identity.firstName}`}
            description="The community is yours. Set visibility anytime from My Weekend."
          />
          <div className="mt-10 flex justify-center">
            <button type="button" className="btn-primary" onClick={() => router.push(next)}>
              {t("join.continue")}
            </button>
          </div>
        </SectionWrap>
      </main>
    );
  }

  if (step === "link") {
    return (
      <main className="pt-[calc(4.75rem+env(safe-area-inset-top))] md:pt-28">
        <SectionWrap>
          <PageHeader
            eyebrow="Magic link"
            title="Check your email"
            description="In the real wedding, this would arrive as a sign-in link. For this preview, continue to confirm your identity."
          />
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                if (pending) join(pending);
                setStep("done");
              }}
            >
              {t("join.openLink")}
            </button>
          </div>
        </SectionWrap>
      </main>
    );
  }

  return (
    <main className="pt-[calc(4.75rem+env(safe-area-inset-top))] md:pt-28">
      <SectionWrap className="bg-ivory">
        <PageHeader
          editId="join"
          eyebrow="Want to join the wedding community?"
          title="No password. Just you."
          description="Browse the whole site without an account. Join only when you want to play, post, or coordinate."
        />
        <form
          className="mx-auto mt-12 max-w-md space-y-6"
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const code = String(data.get("code") ?? "").trim();
            if (code && code.toUpperCase() !== OPTIONAL_GUEST_CODE) {
              setError(t("join.codeError"));
              return;
            }
            const file = data.get("photo");
            let photoDataUrl: string | undefined;
            if (file instanceof File && file.size > 0) {
              photoDataUrl = await readImageAsCompressedDataUrl(file);
            }
            setPending({
              firstName: String(data.get("firstName")),
              lastName: String(data.get("lastName")),
              email: String(data.get("email")),
              city: String(data.get("city")),
              side: String(data.get("side")) as Side,
              photoDataUrl,
            });
            setStep("link");
          }}
        >
          <label className="block">
            <span className="label-caps">{t("join.firstName")}</span>
            <input name="firstName" required className="input-line" />
          </label>
          <label className="block">
            <span className="label-caps">{t("join.lastName")}</span>
            <input name="lastName" required className="input-line" />
          </label>
          <label className="block">
            <span className="label-caps">{t("join.email")}</span>
            <input name="email" type="email" required className="input-line" />
          </label>
          <label className="block">
            <span className="label-caps">{t("join.city")}</span>
            <input name="city" className="input-line" placeholder={t("join.cityPh")} />
          </label>
          <label className="block">
            <span className="label-caps">{t("join.connected")}</span>
            <select name="side" className="input-line" defaultValue="both">
              <option value="janelle">{t("join.side.janelle")}</option>
              <option value="eric">{t("join.side.eric")}</option>
              <option value="both">{t("join.side.both")}</option>
            </select>
          </label>
          <label className="block">
            <span className="label-caps">{t("join.photo")}</span>
            <input name="photo" type="file" accept="image/*" className="mt-3 font-sans text-sm" />
          </label>
          <label className="block">
            <span className="label-caps">{t("join.code")}</span>
            <input name="code" className="input-line" placeholder={t("join.codePh")} />
          </label>
          {error ? <p className="font-sans text-sm text-olive">{error}</p> : null}
          <button type="submit" className="btn-primary w-full">
            {t("join.sendLink")}
          </button>
          <p className="text-center font-sans text-xs text-taupe">
            {t("join.previewCode", { code: OPTIONAL_GUEST_CODE })}
          </p>
        </form>
      </SectionWrap>
    </main>
  );
}
