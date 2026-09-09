import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guest Lounge | Janelle & Eric",
  robots: { index: false, follow: false },
};

export default function LoungeRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-cream">{children}</div>;
}
