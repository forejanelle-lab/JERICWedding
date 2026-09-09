type SectionHeadingProps = {
  label: string;
  script?: string;
  className?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  label,
  script,
  className = "",
  align = "center",
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <div className={`flex flex-col gap-3 ${alignClass} ${className}`}>
      {script && (
        <p className="font-script text-xl italic text-taupe md:text-2xl">{script}</p>
      )}
      <h2 className="font-serif text-3xl font-light tracking-[0.12em] text-charcoal uppercase md:text-4xl lg:text-5xl">
        {label}
      </h2>
    </div>
  );
}
