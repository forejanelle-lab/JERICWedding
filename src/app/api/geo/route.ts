import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { localeFromGeo, type Locale } from "@/lib/i18n/config";

function isPrivateIp(ip: string) {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("172.17.") ||
    ip.startsWith("172.18.") ||
    ip.startsWith("172.19.") ||
    ip.startsWith("172.2") ||
    ip.startsWith("172.30.") ||
    ip.startsWith("172.31.")
  );
}

export async function GET() {
  const h = await headers();
  const country =
    h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || h.get("x-country-code");
  const region = h.get("x-vercel-ip-country-region") || h.get("x-region-code");
  if (country) {
    const locale = localeFromGeo(country, region);
    return NextResponse.json({ locale, source: "headers" satisfies string });
  }

  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
  if (forwarded && !isPrivateIp(forwarded)) {
    try {
      const response = await fetch(
        `http://ip-api.com/json/${encodeURIComponent(forwarded)}?fields=status,countryCode,region,regionName`,
        { next: { revalidate: 3600 } },
      );
      if (response.ok) {
        const data = (await response.json()) as {
          status?: string;
          countryCode?: string;
          region?: string;
          regionName?: string;
        };
        if (data.status === "success") {
          const locale: Locale = localeFromGeo(data.countryCode, data.region, data.regionName);
          return NextResponse.json({ locale, source: "ip" });
        }
      }
    } catch {
      // Fall through to English.
    }
  }

  return NextResponse.json({ locale: "en" satisfies Locale, source: "default" });
}
