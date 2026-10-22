import type { GuestPhoto } from "@/lib/hub/types";

export async function fetchSharedPhotos(): Promise<GuestPhoto[]> {
  try {
    const response = await fetch("/api/photos", { cache: "no-store" });
    if (!response.ok) return [];
    const data = (await response.json()) as { photos?: GuestPhoto[] };
    return Array.isArray(data.photos) ? data.photos : [];
  } catch {
    return [];
  }
}

export async function syncGuestPhoto(photo: GuestPhoto) {
  try {
    const response = await fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photo }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function removeSharedPhoto(id: string) {
  try {
    const response = await fetch(`/api/photos?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    return response.ok;
  } catch {
    return false;
  }
}
