"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSelect } from "@/components/site/LanguageSelect";
import { MOBILE_TABS, NAV_MORE, NAV_PRIMARY } from "@/lib/hub/content";
import { canSeePage, isPageTemporarilyHidden } from "@/lib/hub/access";
import { NAV_I18N } from "@/lib/i18n/dictionaries";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useHub } from "@/lib/hub/store";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const pathname = usePathname();
  const { state, signOut } = useHub();
  const { t } = useI18n();
  const identity = state.identity;
  const primary = NAV_PRIMARY.filter((item) => canSeePage(state, item.href));
  const more = NAV_MORE.filter((item) => canSeePage(state, item.href));
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#E6E0D7]/80 bg-[#F9F7F2]/95 text-[#242424] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center px-5 py-3.5 lg:px-10">
          <Link href="/" className="shrink-0 font-sans text-[0.72rem] uppercase tracking-[0.28em] text-[#242424]">
            J & E
          </Link>

          <nav className="ml-auto hidden items-center gap-7 lg:flex" aria-label={t("nav.main")}>
            {primary.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative whitespace-nowrap pb-1 font-sans text-[0.62rem] uppercase tracking-[0.2em] transition-colors duration-200 ${
                    active ? "text-[#242424]" : "text-[#242424]/70 hover:text-[#242424]"
                  } ${state.adminAuthed && isPageTemporarilyHidden(state, item.href) ? "opacity-40" : ""}`}
                >
                  {t(NAV_I18N[item.href] ?? item.label)}
                  {active ? (
                    <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#2D3B2D]" />
                  ) : null}
                </Link>
              );
            })}
            <div className="relative">
              <button
                type="button"
                className="pb-1 font-sans text-[0.62rem] uppercase tracking-[0.2em] text-[#242424]/70 transition-colors duration-200 hover:text-[#242424]"
                onClick={() => setMoreOpen((open) => !open)}
                aria-expanded={moreOpen}
              >
                {t("nav.more")}
              </button>
              {moreOpen ? (
                <div className="absolute right-0 top-full mt-2 w-40 rounded-[14px] border border-[#E6E0D7] bg-[#F9F7F2] py-1.5 text-right shadow-[0_12px_30px_rgba(45,59,45,0.06)]">
                  {more.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block px-4 py-1.5 font-sans text-[0.6rem] uppercase tracking-[0.16em] text-[#242424]/70 hover:text-[#242424] ${
                        state.adminAuthed && isPageTemporarilyHidden(state, item.href) ? "opacity-40" : ""
                      }`}
                    >
                      {t(NAV_I18N[item.href] ?? item.label)}
                    </Link>
                  ))}
                  <Link
                    href={identity ? "/me" : "/join"}
                    className="block px-4 py-1.5 font-sans text-[0.6rem] uppercase tracking-[0.16em] text-[#2D3B2D]"
                  >
                    {identity ? t("nav.myWeekend") : t("nav.join")}
                  </Link>
                  <button
                    type="button"
                    className="block w-full px-4 py-1.5 text-right font-sans text-[0.6rem] uppercase tracking-[0.16em] text-[#77736C] hover:text-[#242424]"
                    onClick={() => void signOut()}
                  >
                    {t("nav.signOut")}
                  </button>
                </div>
              ) : null}
            </div>
          </nav>

          <div className="ml-auto lg:ml-6">
            <LanguageSelect />
          </div>

          <button
            type="button"
            className="relative z-50 ml-2 flex h-9 w-9 flex-col items-center justify-center gap-1.5 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
          >
            <span className={`block h-px w-5 bg-current transition-transform duration-200 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`block h-px w-5 bg-current transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-px w-5 bg-current transition-transform duration-200 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 overflow-y-auto bg-[#F9F7F2] transition-opacity duration-300 lg:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav className="flex flex-col items-end px-6 pt-20 pb-10 text-right" aria-label={t("nav.mobile")}>
          {primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`py-2 font-sans text-[0.8rem] uppercase tracking-[0.18em] text-[#242424] ${
                state.adminAuthed && isPageTemporarilyHidden(state, item.href) ? "opacity-40" : ""
              }`}
            >
              {t(NAV_I18N[item.href] ?? item.label)}
            </Link>
          ))}
          <span className="mt-5 mb-1 font-sans text-[0.52rem] uppercase tracking-[0.22em] text-[#77736C]">{t("nav.more")}</span>
          {more.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`py-2 font-sans text-[0.8rem] uppercase tracking-[0.18em] text-[#242424] ${
                state.adminAuthed && isPageTemporarilyHidden(state, item.href) ? "opacity-40" : ""
              }`}
            >
              {t(NAV_I18N[item.href] ?? item.label)}
            </Link>
          ))}
          <Link href={identity ? "/me" : "/join"} className="mt-5 py-2 font-sans text-[0.8rem] uppercase tracking-[0.18em] text-[#2D3B2D]">
            {identity ? t("nav.myWeekend") : t("nav.join")}
          </Link>
          <button
            type="button"
            className="py-2 font-sans text-[0.8rem] uppercase tracking-[0.18em] text-[#77736C]"
            onClick={() => void signOut()}
          >
            {t("nav.signOut")}
          </button>
        </nav>
      </div>
    </>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  const { state } = useHub();
  const { t } = useI18n();
  const tabs = MOBILE_TABS.filter((tab) => canSeePage(state, tab.href));
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E6E0D7] bg-[#F9F7F2]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md md:hidden"
      aria-label={t("nav.quick")}
    >
      <ul
        className="grid"
        style={{ gridTemplateColumns: `repeat(${Math.max(tabs.length, 1)}, minmax(0, 1fr))` }}
      >
        {tabs.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 py-1 font-sans text-[0.52rem] uppercase tracking-[0.12em] ${
                  active ? "text-[#2D3B2D]" : "text-[#77736C]"
                }`}
              >
                <TabIcon name={tab.icon} />
                {t(NAV_I18N[tab.href] ?? tab.label)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function TabIcon({ name }: { name: string }) {
  const common = "h-5 w-5";
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M4 11.5 12 4l8 7.5V20H4z" />
      </svg>
    );
  }
  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    );
  }
  if (name === "car") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M5 16h14l1-5-3-4H7L4 11z" />
        <circle cx="7.5" cy="16.5" r="1.5" />
        <circle cx="16.5" cy="16.5" r="1.5" />
      </svg>
    );
  }
  if (name === "heart") {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 19s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="8" />
      <path d="M10 9.5v5l4.5-2.5z" />
    </svg>
  );
}
