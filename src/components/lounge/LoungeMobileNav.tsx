"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LOUNGE_MOBILE_NAV } from "@/lib/lounge/constants";

const CREATE_OPTIONS = [
  { label: "Post", href: "/lounge/community?create=post" },
  { label: "Poll", href: "/lounge/community?create=poll" },
  { label: "Question", href: "/lounge/community?create=question" },
  { label: "Photo", href: "/lounge/community?create=photo" },
  { label: "Challenge", href: "/lounge/challenges" },
] as const;

function NavIcon({ icon, active }: { icon: string; active: boolean }) {
  const stroke = active ? "currentColor" : "currentColor";
  const className = active ? "text-charcoal" : "text-taupe";

  if (icon === "home") {
    return (
      <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" stroke={stroke} strokeWidth="1.2" />
      </svg>
    );
  }
  if (icon === "community") {
    return (
      <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 8h10M7 12h6M5 20l1.5-4H18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h1.5" stroke={stroke} strokeWidth="1.2" />
      </svg>
    );
  }
  if (icon === "games") {
    return (
      <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="8" width="16" height="10" rx="2" stroke={stroke} strokeWidth="1.2" />
        <path d="M9 12v4M7 14h4M15 13h.01M17 15h.01" stroke={stroke} strokeWidth="1.2" />
      </svg>
    );
  }
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke={stroke} strokeWidth="1.2" />
      <path d="M5 20a7 7 0 0 1 14 0" stroke={stroke} strokeWidth="1.2" />
    </svg>
  );
}

export function LoungeMobileNav() {
  const pathname = usePathname();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      {createOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/30 backdrop-blur-[2px] md:hidden"
          onClick={() => setCreateOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-taupe/15 bg-ivory/95 backdrop-blur-md md:hidden"
        aria-label="Mobile lounge navigation"
      >
        {createOpen && (
          <div className="absolute bottom-full left-0 right-0 border-t border-taupe/15 bg-ivory px-4 py-4">
            <p className="mb-3 font-sans text-[0.55rem] uppercase tracking-[0.25em] text-taupe">
              Create
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CREATE_OPTIONS.map((option) => (
                <Link
                  key={option.label}
                  href={option.href}
                  onClick={() => setCreateOpen(false)}
                  className="border border-taupe/20 px-4 py-3 text-center font-sans text-[0.65rem] uppercase tracking-[0.18em] text-charcoal"
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-5 items-end px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
          {LOUNGE_MOBILE_NAV.slice(0, 2).map((item) => {
            const active =
              item.href === "/lounge"
                ? pathname === "/lounge"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 py-2"
              >
                <NavIcon icon={item.icon} active={active} />
                <span
                  className={`font-sans text-[0.55rem] uppercase tracking-[0.15em] ${
                    active ? "text-charcoal" : "text-taupe"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setCreateOpen((open) => !open)}
              className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full border border-charcoal bg-charcoal text-ivory shadow-[0_8px_24px_rgba(28,28,28,0.18)] transition-transform active:scale-95"
              aria-label="Create"
              aria-expanded={createOpen}
            >
              <span className="text-2xl leading-none">{createOpen ? "×" : "+"}</span>
            </button>
          </div>

          {LOUNGE_MOBILE_NAV.slice(2).map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 py-2"
              >
                <NavIcon icon={item.icon} active={active} />
                <span
                  className={`font-sans text-[0.55rem] uppercase tracking-[0.15em] ${
                    active ? "text-charcoal" : "text-taupe"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
