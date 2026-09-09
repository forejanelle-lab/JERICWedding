import { requireSupabaseClient } from "@/lib/supabase/server";
import type { GuestRegion } from "@/lib/types/database";
import { LoungePageHeader } from "@/components/lounge/LoungePageHeader";
import { RegionFilterLinks } from "@/components/portal/RegionFilter";
import { RideCard } from "@/components/portal/RideCard";
import { RideForm } from "@/components/portal/RideForm";
import { RECOMMENDED_GUESTS } from "@/lib/lounge/constants";

export default async function LoungeTravelPage({
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

  let rides = null;
  try {
    const supabase = await requireSupabaseClient();
    let query = supabase.from("rides").select("*").order("ride_date", { ascending: true });
    if (regionFilter !== "all") {
      query = query.eq("region_tag", regionFilter);
    }
    if (typeFilter !== "all") {
      query = query.eq("type", typeFilter);
    }
    const { data } = await query;
    rides = data;
  } catch {
    rides = null;
  }

  return (
    <div>
      <LoungePageHeader
        title="Travel Buddies"
        script="Find your Italy crew"
        description="Share travel plans optionally — we'll suggest guests with similar arrival times, hotels, and interests."
      />

      <div className="mb-10 border border-gold/20 bg-gold/5 p-6 md:p-8">
        <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-gold">
          It&apos;s a Match
        </p>
        <h2 className="mt-3 font-serif text-2xl font-light text-charcoal">
          You and Tyler both arrive in Rome on September 4
        </h2>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-xl text-charcoal">Tyler Williams</p>
            <p className="font-sans text-sm text-taupe">Miami, FL</p>
            <p className="mt-1 font-sans text-sm text-charcoal/70">
              Arriving Sept 4 at 10:30 AM
            </p>
          </div>
          <a
            href="/lounge/messages"
            className="inline-flex border border-charcoal bg-charcoal px-6 py-3 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-ivory"
          >
            Start a Chat
          </a>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {RECOMMENDED_GUESTS.map((guest) => (
          <article key={guest.id} className="border border-taupe/15 bg-ivory p-5">
            <h3 className="font-serif text-xl text-charcoal">{guest.name}</h3>
            <p className="mt-1 font-sans text-sm text-taupe">{guest.city}</p>
            <p className="mt-3 font-sans text-sm text-charcoal/70">{guest.reason}</p>
          </article>
        ))}
      </div>

      <div className="mb-8 border-t border-taupe/15 pt-10">
        <h2 className="mb-6 font-serif text-2xl font-light tracking-[0.08em] text-charcoal uppercase">
          Ride Coordination
        </h2>
        <RegionFilterLinks basePath="/lounge/travel" current={regionFilter} />
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
