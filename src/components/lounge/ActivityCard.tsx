import Link from "next/link";
import type { LoungeActivity } from "@/lib/lounge/constants";

type ActivityCardProps = {
  activity: LoungeActivity;
  variant?: "light" | "dark";
};

export function ActivityCard({ activity, variant = "light" }: ActivityCardProps) {
  const isDark = variant === "dark";

  return (
    <Link
      href={activity.href}
      className={`group block border p-6 transition-all duration-500 ${
        isDark
          ? "border-ivory/10 bg-ivory/[0.04] hover:border-gold/30 hover:bg-ivory/[0.08]"
          : "border-taupe/15 bg-ivory hover:border-charcoal/20 hover:shadow-[0_12px_40px_rgba(28,28,28,0.06)]"
      }`}
    >
      <div className="flex items-start gap-4">
        <span className="text-2xl transition-transform duration-500 group-hover:scale-110" aria-hidden="true">
          {activity.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={`font-sans text-[0.55rem] uppercase tracking-[0.25em] ${
              isDark ? "text-gold/80" : "text-olive"
            }`}
          >
            {activity.type}
          </p>
          <h3
            className={`mt-2 font-serif text-xl font-light tracking-[0.06em] uppercase ${
              isDark ? "text-ivory" : "text-charcoal"
            }`}
          >
            {activity.title}
          </h3>
          <p
            className={`mt-2 font-sans text-sm ${
              isDark ? "text-ivory/60" : "text-charcoal/60"
            }`}
          >
            {activity.subtitle}
          </p>
          <p
            className={`mt-1 font-sans text-xs ${
              isDark ? "text-ivory/45" : "text-taupe"
            }`}
          >
            {activity.meta}
          </p>
          <span
            className={`mt-5 inline-flex items-center gap-3 font-sans text-[0.6rem] uppercase tracking-[0.25em] transition-colors ${
              isDark
                ? "text-ivory/70 group-hover:text-ivory"
                : "text-taupe group-hover:text-charcoal"
            }`}
          >
            {activity.cta}
            <span className="block h-px w-6 bg-current transition-all group-hover:w-10" />
          </span>
        </div>
      </div>
    </Link>
  );
}
