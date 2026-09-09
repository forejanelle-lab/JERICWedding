type AvatarProps = {
  name: string;
  hue?: number;
  photo?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "h-9 w-9 text-[0.7rem]",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
};

export function Avatar({ name, hue = 40, photo, size = "md" }: AvatarProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt=""
        className={`${sizes[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      className={`${sizes[size]} inline-flex items-center justify-center rounded-full font-serif text-ivory`}
      style={{ background: `hsl(${90 + (hue % 50)} 18% 32%)` }}
      aria-hidden="true"
    >
      {initials || "G"}
    </span>
  );
}
