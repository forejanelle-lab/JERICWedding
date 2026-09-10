export async function reportSiteVisit(input: {
  firstName: string;
  lastName?: string;
  email?: string;
  kind: "login" | "visit";
}) {
  try {
    await fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    // Visit logging should never block entering the site.
  }
}
