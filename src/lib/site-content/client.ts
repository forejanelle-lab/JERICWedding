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

async function postContent(content: SiteContent) {
  const response = await fetch("/api/site-content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });
  return response.ok;
}

export async function syncSiteContent(content: SiteContent) {
  const images = content.siteImages ?? {};
  const times = content.siteImageUpdatedAt ?? {};
  const lightImages = Object.fromEntries(Object.entries(images).filter(([, src]) => !src.startsWith("data:")));
  const dataImages = Object.entries(images).filter(([, src]) => src.startsWith("data:"));
  try {
    const saved = await postContent({ ...content, siteImages: lightImages, siteImageUpdatedAt: times });
    if (!saved && !dataImages.length) return false;
    let imagesSaved = true;
    for (const [id, src] of dataImages) {
      const one = await postContent({
        ...content,
        siteImages: { [id]: src },
        siteImageUpdatedAt: { [id]: times[id] ?? Date.now() },
      });
      imagesSaved = imagesSaved && one;
    }
    return saved || imagesSaved;
  } catch {
    return false;
  }
}
