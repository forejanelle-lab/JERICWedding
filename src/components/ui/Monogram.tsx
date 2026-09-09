type MonogramProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "text-sm tracking-[0.35em]",
  md: "text-base tracking-[0.45em]",
  lg: "text-lg tracking-[0.5em]",
};

export function Monogram({ className = "", size = "md" }: MonogramProps) {
  return (
    <span
      className={`font-sans uppercase text-charcoal/80 ${sizeClasses[size]} ${className}`}
      aria-label="Janelle and Eric monogram"
    >
      J / E
    </span>
  );
}
