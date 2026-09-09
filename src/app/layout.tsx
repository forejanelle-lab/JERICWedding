import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Cormorant_Garamond, Great_Vibes, Inter } from "next/font/google";
import { hasAdminCookie } from "@/lib/gate/auth";
import { HubProvider } from "@/lib/hub/store";
import { isLocale, LANG_COOKIE, localeFromGeo, type Locale } from "@/lib/i18n/config";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-jost",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
});

const greatVibes = Great_Vibes({
  variable: "--font-hand",
  subsets: ["latin", "latin-ext"],
  weight: "400",
});

async function readInitialLocale(): Promise<Locale> {
  const jar = await cookies();
  const fromCookie = jar.get(LANG_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  const h = await headers();
  const fromHeader = h.get("x-jeric-lang");
  if (isLocale(fromHeader)) return fromHeader;
  return localeFromGeo(
    h.get("x-vercel-ip-country") || h.get("cf-ipcountry"),
    h.get("x-vercel-ip-country-region"),
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Janelle & Eric | September 4–6, 2027 · Campania, Italy",
  description:
    "A wedding weekend in Campania — story, travel, community, and celebration for Janelle & Eric.",
  openGraph: {
    title: "Janelle & Eric",
    description: "September 4–6, 2027 · Campania, Italy",
    images: ["/images/casale-bosco.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adminFromServer = await hasAdminCookie();
  const locale = await readInitialLocale();
  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${inter.variable} ${greatVibes.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full bg-ivory text-charcoal antialiased">
        <LanguageProvider initialLocale={locale}>
          <HubProvider adminFromServer={adminFromServer}>{children}</HubProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
