type OliveBranchProps = {
  className?: string;
};

export function OliveBranch({ className = "" }: OliveBranchProps) {
  return (
    <svg
      viewBox="0 0 120 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-8 w-24 text-olive/60 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M4 16C20 16 28 8 40 8C52 8 60 16 76 16"
        stroke="currentColor"
        strokeWidth="0.75"
      />
      <path
        d="M76 16C92 16 100 24 116 24"
        stroke="currentColor"
        strokeWidth="0.75"
      />
      <ellipse cx="28" cy="10" rx="4" ry="2" fill="currentColor" opacity="0.5" />
      <ellipse cx="36" cy="14" rx="3.5" ry="1.8" fill="currentColor" opacity="0.4" />
      <ellipse cx="44" cy="9" rx="4" ry="2" fill="currentColor" opacity="0.5" />
      <ellipse cx="88" cy="22" rx="4" ry="2" fill="currentColor" opacity="0.5" />
      <ellipse cx="96" cy="18" rx="3.5" ry="1.8" fill="currentColor" opacity="0.4" />
      <ellipse cx="104" cy="23" rx="4" ry="2" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
