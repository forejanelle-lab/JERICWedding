import type { SiteEditor } from "@/lib/editors/match";

export async function syncSiteEditors(editors: SiteEditor[]) {
  try {
    await fetch("/api/site-editors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editors }),
    });
  } catch {
    // Keep the local invite flag even if the shared list is unavailable.
  }
}

export async function checkSiteEditor(person: {
  email?: string;
  firstName?: string;
  lastName?: string;
}) {
  const params = new URLSearchParams();
  if (person.email) params.set("email", person.email);
  if (person.firstName) params.set("firstName", person.firstName);
  if (person.lastName) params.set("lastName", person.lastName);
  try {
    const response = await fetch(`/api/site-editors?${params.toString()}`, { cache: "no-store" });
    if (!response.ok) return false;
    const data = (await response.json()) as { editor?: boolean };
    return Boolean(data.editor);
  } catch {
    return false;
  }
}
