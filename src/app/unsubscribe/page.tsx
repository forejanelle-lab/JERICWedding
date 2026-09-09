"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function UnsubscribeInner() {
  const search = useSearchParams();
  const email = search.get("email") ?? "";
  const token = search.get("token") ?? "";
  const [status, setStatus] = useState<"working" | "ok" | "error">(email ? "working" : "error");

  useEffect(() => {
    if (!email) {
      setStatus("error");
      return;
    }
    fetch("/api/rides/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token }),
    })
      .then((response) => setStatus(response.ok ? "ok" : "error"))
      .catch(() => setStatus("error"));
  }, [email, token]);

  return (
    <main className="flex min-h-full items-center justify-center px-6 py-24">
      <div className="max-w-md text-center">
        <p className="font-script text-2xl italic text-taupe">Janelle & Eric</p>
        <h1 className="mt-3 font-serif text-3xl font-light tracking-[0.08em] uppercase">
          {status === "ok" ? "You're unsubscribed" : status === "working" ? "One moment" : "We couldn't unsubscribe"}
        </h1>
        <p className="mt-4 font-sans text-sm text-charcoal/70">
          {status === "ok"
            ? `Ride board summaries will no longer go to ${email}. You can still use the ride board on the site.`
            : status === "working"
              ? "Removing this address from the daily ride summary."
              : "Check the link from your email, or unsubscribe from My Weekend."}
        </p>
      </div>
    </main>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-full items-center justify-center px-6 py-24">
          <p className="font-sans text-sm text-charcoal/70">One moment</p>
        </main>
      }
    >
      <UnsubscribeInner />
    </Suspense>
  );
}
