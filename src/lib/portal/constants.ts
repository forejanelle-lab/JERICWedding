import type { BoardCategory, GuestRegion } from "@/lib/types/database";

export const BOARD_CATEGORIES: {
  value: BoardCategory;
  label: string;
}[] = [
  { value: "general", label: "General" },
  { value: "travel_tips", label: "Travel Tips" },
  { value: "meetups", label: "Meetups" },
  { value: "us_travelers", label: "US Travelers" },
  { value: "europe_guests", label: "Europe Guests" },
];

export const REGION_OPTIONS: { value: GuestRegion; label: string }[] = [
  { value: "us", label: "United States" },
  { value: "europe", label: "Europe / Italy" },
];

export const REGION_FILTER_OPTIONS: {
  value: GuestRegion | "all";
  label: string;
}[] = [
  { value: "all", label: "All Regions" },
  { value: "us", label: "US" },
  { value: "europe", label: "Europe" },
];

export const RIDE_TYPE_OPTIONS: { value: "offer" | "request"; label: string }[] =
  [
    { value: "offer", label: "Offering a Ride" },
    { value: "request", label: "Need a Ride" },
  ];

export const PORTAL_NAV_ITEMS = [
  { label: "Overview", href: "/portal" },
  { label: "Guests", href: "/portal/profile" },
  { label: "Rides", href: "/portal/rides" },
  { label: "Boards", href: "/portal/boards" },
] as const;

export function formatRegion(region: GuestRegion | null | undefined): string {
  if (region === "us") return "United States";
  if (region === "europe") return "Europe";
  return "—";
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function categoryLabel(category: BoardCategory): string {
  return (
    BOARD_CATEGORIES.find((item) => item.value === category)?.label ?? category
  );
}
