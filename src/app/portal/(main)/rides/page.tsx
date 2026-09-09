import { requireSupabaseClient } from "@/lib/supabase/server";
import type { GuestRegion } from "@/lib/types/database";
import { PortalPageHeader } from "@/components/portal/PortalShared";
import { RegionFilterLinks } from "@/components/portal/RegionFilter";
import { RideCard } from "@/components/portal/RideCard";
import { RideForm } from "@/components/portal/RideForm";

export default async function PortalRidesPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; type?: string }>;
}) {
  const params = await searchParams;
  const regionFilter =
    params.region === "us" || params.region === "europe"
      ? (params.region as GuestRegion)
      : "all";
  const typeFilter =
    params.type === "offer" || params.type === "request" ? params.type : "all";

  const supabase = await requireSupabaseClient();
  let query = supabase.from("rides").select("*").order("ride_date", { ascending: true });

  if (regionFilter !== "all") {
    query = query.eq("region_tag", regionFilter);
  }
  if (typeFilter !== "all") {
    query = query.eq("type", typeFilter);
  }

  const { data: rides } = await query;

  return (
    <div>
      <PortalPageHeader
        title="Ride Coordination"
        script="Share the journey"
        description="Offer a seat or request a ride between the airport, your hotel, and the venue."
      />

      <div className="mb-8 flex flex-wrap gap-2">
        <RegionFilterLinks basePath="/portal/rides" current={regionFilter} />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {[
          { value: "all", label: "All Types" },
          { value: "offer", label: "Offers" },
          { value: "request", label: "Requests" },
        ].map((option) => {
          const queryParams = new URLSearchParams();
          if (regionFilter !== "all") queryParams.set("region", regionFilter);
          if (option.value !== "all") queryParams.set("type", option.value);
          const href = queryParams.toString()
            ? `/portal/rides?${queryParams.toString()}`
            : "/portal/rides";
          const active = typeFilter === option.value;
          return (
            <a
              key={option.value}
              href={href}
              className={`border px-4 py-2 font-sans text-[0.6rem] uppercase tracking-[0.2em] transition-colors ${
                active
                  ? "border-charcoal bg-charcoal text-ivory"
                  : "border-taupe/25 text-taupe hover:border-charcoal hover:text-charcoal"
              }`}
            >
              {option.label}
            </a>
          );
        })}
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        <section className="space-y-4">
          {rides && rides.length > 0 ? (
            rides.map((ride) => <RideCard key={ride.id} ride={ride} />)
          ) : (
            <p className="border border-dashed border-taupe/25 px-6 py-12 text-center font-sans text-sm text-charcoal/60">
              No rides posted yet. Be the first to share your travel plans.
            </p>
          )}
        </section>

        <aside>
          <RideForm />
        </aside>
      </div>
    </div>
  );
}
