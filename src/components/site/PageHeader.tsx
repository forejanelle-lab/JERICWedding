"use client";

import Link from "next/link";
import { EditText } from "@/components/site/EditText";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export function PageHeader({
  eyebrow,
  title,
  description,
  dark = false,
  compact = false,
  editId,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  dark?: boolean;
  compact?: boolean;
  editId?: string;
}) {
  return (
    <header className="mx-auto max-w-3xl text-center">
      {eyebrow ? (
        editId ? (
          <EditText
            id={`${editId}.eyebrow`}
            as="p"
            className={`font-script italic ${compact ? "text-lg md:text-xl" : "text-xl md:text-2xl"} ${dark ? "text-ivory/50" : "text-taupe"}`}
          >
            {eyebrow}
          </EditText>
        ) : (
          <p className={`font-script italic ${compact ? "text-lg md:text-xl" : "text-xl md:text-2xl"} ${dark ? "text-ivory/50" : "text-taupe"}`}>
            {eyebrow}
          </p>
        )
      ) : null}
      {editId ? (
        <EditText
          id={`${editId}.title`}
          as="h1"
          className={`font-serif font-light leading-tight tracking-[0.06em] uppercase md:tracking-[0.12em] ${
            compact ? "mt-1 text-[1.85rem] md:text-4xl" : "mt-3 text-[1.85rem] md:text-5xl"
          } ${dark ? "text-ivory" : "text-charcoal"}`}
        >
          {title}
        </EditText>
      ) : (
        <h1
          className={`font-serif font-light leading-tight tracking-[0.06em] uppercase md:tracking-[0.12em] ${
            compact ? "mt-1 text-[1.85rem] md:text-4xl" : "mt-3 text-[1.85rem] md:text-5xl"
          } ${dark ? "text-ivory" : "text-charcoal"}`}
        >
          {title}
        </h1>
      )}
      {description ? (
        editId ? (
          <EditText
            id={`${editId}.description`}
            as="p"
            multiline
            className={`mx-auto max-w-2xl font-sans leading-relaxed ${
              compact ? "mt-2 text-sm md:text-base" : "mt-5 text-base md:text-lg"
            } ${dark ? "text-ivory/70" : "text-charcoal/70"}`}
          >
            {description}
          </EditText>
        ) : (
          <p
            className={`mx-auto max-w-2xl font-sans leading-relaxed ${
              compact ? "mt-2 text-sm md:text-base" : "mt-5 text-base md:text-lg"
            } ${dark ? "text-ivory/70" : "text-charcoal/70"}`}
          >
            {description}
          </p>
        )
      ) : null}
    </header>
  );
}

export function JoinPrompt({
  title = "Want to join the wedding community?",
  body = "Browse freely. Join when you want to post, play, coordinate rides, or appear in the guest directory — no password required.",
}: {
  title?: string;
  body?: string;
}) {
  const { t } = useI18n();
  return (
    <div className="soft-card px-6 py-8 text-center md:px-10">
      <p className="font-serif text-2xl font-light tracking-[0.08em] text-charcoal uppercase">
        {title}
      </p>
      <p className="mx-auto mt-3 max-w-lg font-sans text-sm leading-relaxed text-charcoal/70">
        {body}
      </p>
      <Link href="/join" className="btn-primary mt-6">
        {t("joinPrompt.cta")}
      </Link>
    </div>
  );
}

export function SectionWrap({
  id,
  children,
  className = "bg-ivory",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`${className} px-4 py-10 md:px-10 md:py-24 lg:px-16`}>
      {children}
    </section>
  );
}
