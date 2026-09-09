"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PORTAL_NAV_ITEMS } from "@/lib/portal/constants";
import { Monogram } from "@/components/ui/Monogram";

export function PortalNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-taupe/15 bg-ivory/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/portal" className="flex items-center gap-4">
          <Monogram size="sm" />
          <span className="hidden font-sans text-[0.6rem] uppercase tracking-[0.25em] text-taupe sm:inline">
            Guest Portal
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Portal">
          {PORTAL_NAV_ITEMS.map((item) => {
            const active =
              item.href === "/portal"
                ? pathname === "/portal"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-sans text-[0.65rem] uppercase tracking-[0.2em] transition-colors ${
                  active ? "text-charcoal" : "text-taupe hover:text-charcoal"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/"
            className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-taupe transition-colors hover:text-charcoal"
          >
            Wedding Site
          </Link>
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span
            className={`block h-px w-6 bg-charcoal transition-transform ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`block h-px w-6 bg-charcoal transition-opacity ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-px w-6 bg-charcoal transition-transform ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {menuOpen && (
        <nav
          className="border-t border-taupe/15 px-6 py-6 md:hidden"
          aria-label="Portal mobile"
        >
          <ul className="space-y-4">
            {PORTAL_NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-serif text-xl font-light tracking-[0.1em] text-charcoal uppercase"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="font-sans text-sm uppercase tracking-[0.2em] text-taupe"
              >
                Wedding Site
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
