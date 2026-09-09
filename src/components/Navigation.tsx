"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants";
import { Monogram } from "@/components/ui/Monogram";

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const headerClasses = scrolled
    ? "bg-ivory/95 text-charcoal shadow-[0_1px_0_rgba(28,28,28,0.06)] backdrop-blur-md"
    : "bg-transparent text-ivory";

  const linkClasses = scrolled
    ? "text-charcoal/70 hover:text-charcoal"
    : "text-ivory/80 hover:text-ivory";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${headerClasses}`}
      >
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-5 md:px-10 lg:px-16">
          <a href="#" aria-label="Return to top">
            <Monogram
              size="sm"
              className={scrolled ? "text-charcoal/70" : "text-ivory/90"}
            />
          </a>

          <nav className="mt-5 hidden lg:block" aria-label="Main">
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 xl:gap-x-12">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`font-sans text-[0.65rem] font-normal uppercase tracking-[0.25em] transition-colors duration-300 ${linkClasses}`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/lounge/login"
                  className={`font-sans text-[0.65rem] font-normal uppercase tracking-[0.25em] transition-colors duration-300 ${linkClasses}`}
                >
                  Guest Lounge
                </Link>
              </li>
            </ul>
          </nav>

          <button
            type="button"
            className={`absolute right-6 top-5 flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden ${scrolled ? "text-charcoal" : "text-ivory"}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <span
              className={`block h-px w-6 bg-current transition-transform duration-300 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span
              className={`block h-px w-6 bg-current transition-opacity duration-300 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-px w-6 bg-current transition-transform duration-300 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-ivory transition-opacity duration-500 lg:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <nav
          className="flex h-full flex-col items-center justify-center gap-8"
          aria-label="Mobile"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="font-serif text-2xl font-light tracking-[0.15em] text-charcoal uppercase"
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/lounge/login"
            onClick={() => setMenuOpen(false)}
            className="font-serif text-2xl font-light tracking-[0.15em] text-charcoal uppercase"
          >
            Guest Lounge
          </Link>
        </nav>
      </div>
    </>
  );
}
