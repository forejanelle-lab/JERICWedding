"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LOUNGE_NAV_ITEMS } from "@/lib/lounge/constants";
import { Monogram } from "@/components/ui/Monogram";
import { leaveLounge } from "@/lib/lounge/actions";

export function LoungeNav({ guestName }: { guestName: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-taupe/15 bg-ivory/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/lounge" className="flex items-center gap-4">
          <Monogram size="sm" />
          <div className="hidden sm:block">
            <p className="font-sans text-[0.55rem] uppercase tracking-[0.25em] text-taupe">
              Guest Lounge
            </p>
            <p className="font-serif text-sm text-charcoal">{guestName}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 xl:flex" aria-label="Guest Lounge">
          {LOUNGE_NAV_ITEMS.slice(0, 8).map((item) => {
            const active =
              item.href === "/lounge"
                ? pathname === "/lounge"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-sans text-[0.6rem] uppercase tracking-[0.18em] transition-colors ${
                  active ? "text-charcoal" : "text-taupe hover:text-charcoal"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="hidden font-sans text-[0.6rem] uppercase tracking-[0.18em] text-taupe transition-colors hover:text-charcoal md:inline"
          >
            Wedding Site
          </Link>
          <form action={leaveLounge}>
            <button
              type="submit"
              className="font-sans text-[0.6rem] uppercase tracking-[0.18em] text-taupe transition-colors hover:text-charcoal"
            >
              Sign Out
            </button>
          </form>
          <button
            type="button"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 xl:hidden"
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
      </div>

      {menuOpen && (
        <nav className="border-t border-taupe/15 px-6 py-6 xl:hidden" aria-label="Guest Lounge mobile">
          <ul className="grid gap-3 sm:grid-cols-2">
            {LOUNGE_NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 font-sans text-sm uppercase tracking-[0.15em] text-charcoal"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="block py-2 font-sans text-sm uppercase tracking-[0.15em] text-taupe"
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
