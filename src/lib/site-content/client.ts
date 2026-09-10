import type { SiteContent } from "@/lib/site-content/types";

export async function fetchSiteContent(): Promise<SiteContent | null> {
  try {
    const response = await fetch("/api/site-content", { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as SiteContent;
  } catch {
    return null;
  }
}

export async function syncSiteContent(content: SiteContent) {
  try {
    await fetch("/api/site-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
  } catch {
    // Keep local edits even if the shared copy is unavailable.
  }
}
