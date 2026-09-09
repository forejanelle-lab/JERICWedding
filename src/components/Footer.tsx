"use client";

import Link from "next/link";
import { EditText } from "@/components/site/EditText";
import { canSeePage } from "@/lib/hub/access";
import { WEDDING } from "@/lib/hub/content";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const FOOTER_LINKS = [
  { href: "/weekend", key: "footer.weekend" },
  { href: "/travel", key: "footer.travel" },
  { href: "/rides", key: "footer.rides" },
  { href: "/play", key: "footer.play" },
  { href: "/rsvp", key: "footer.rsvp" },
  { href: "/faq", key: "footer.faq" },
] as const;

export function Footer() {
  const { t } = useI18n();
  const { state } = useHub();
  const links = FOOTER_LINKS.filter((item) => canSeePage(state, item.href));
  return (
    <footer className="border-t border-taupe/10 bg-ivory px-6 pb-28 pt-16 text-center md:px-10 md:pb-20 md:pt-24">
      <EditText id="footer.couple" as="p" className="font-serif text-3xl font-light tracking-[0.12em] text-charcoal uppercase md:text-4xl">
        {WEDDING.couple}
      </EditText>
      <div className="mt-6 space-y-2">
        <EditText id="footer.date" as="p" className="font-sans text-xs uppercase tracking-[0.35em] text-charcoal/70">
          {WEDDING.date}
        </EditText>
        <EditText id="footer.location" as="p" className="font-sans text-xs uppercase tracking-[0.35em] text-taupe">
          {WEDDING.location}
        </EditText>
      </div>
      <nav className="mx-auto mt-10 flex max-w-lg flex-wrap justify-center gap-x-6 gap-y-3 font-sans text-[0.6rem] uppercase tracking-[0.2em] text-taupe">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className="hover:text-charcoal">
            {t(item.key)}
          </Link>
        ))}
        <Link href="/admin" className="hover:text-charcoal">{t("footer.admin")}</Link>
      </nav>
      <EditText id="footer.love" as="p" className="mt-10 font-script text-xl italic text-taupe">
        With love, Janelle & Eric
      </EditText>
    </footer>
  );
}
