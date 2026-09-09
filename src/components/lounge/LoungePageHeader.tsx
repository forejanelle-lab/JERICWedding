import type { ReactNode } from "react";

type LoungePageHeaderProps = {
  title: string;
  script?: string;
  description?: string;
  children?: ReactNode;
};

export function LoungePageHeader({
  title,
  script,
  description,
  children,
}: LoungePageHeaderProps) {
  return (
    <header className="mb-10 md:mb-14">
      {script && (
        <p className="font-script text-xl italic text-taupe md:text-2xl">{script}</p>
      )}
      <h1 className="mt-3 font-serif text-3xl font-light tracking-[0.1em] text-charcoal uppercase md:text-4xl lg:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-charcoal/65">
          {description}
        </p>
      )}
      {children}
    </header>
  );
}
