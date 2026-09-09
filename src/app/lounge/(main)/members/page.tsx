import { requireSupabaseClient } from "@/lib/supabase/server";
import type { GuestRegion } from "@/lib/types/database";
import { ProfileForm } from "@/components/portal/ProfileForm";
import {
  GuestProfileCard,
} from "@/components/portal/PortalShared";
import { RegionFilterLinks } from "@/components/portal/RegionFilter";
import { LoungePageHeader } from "@/components/lounge/LoungePageHeader";

export default async function LoungeMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const params = await searchParams;
  const regionFilter =
    params.region === "us" || params.region === "europe"
      ? (params.region as GuestRegion)
      : "all";

  let guests = null;
  try {
    const supabase = await requireSupabaseClient();
    let query = supabase.from("profiles").select("*").order("display_name", {
      ascending: true,
    });
    if (regionFilter !== "all") {
      query = query.eq("region", regionFilter);
    }
    const { data } = await query;
    guests = data;
  } catch {
    guests = null;
  }

  return (
    <div>
      <LoungePageHeader
        title="Members"
        script="Meet the guest list"
        description="Browse fellow guests, see where they're from, and say hello before Italy."
      />

      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <section>
          <h2 className="mb-6 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-olive">
            Add Your Profile
          </h2>
          <ProfileForm />
        </section>

        <section>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-sans text-[0.65rem] uppercase tracking-[0.25em] text-olive">
              All Guests
            </h2>
            <RegionFilterLinks
              basePath="/lounge/members"
              current={regionFilter}
            />
          </div>

          {guests && guests.length > 0 ? (
            <div className="grid gap-4">
              {guests.map((guest) => (
                <GuestProfileCard
                  key={guest.id}
                  displayName={guest.display_name}
                  region={guest.region}
                  homeCity={guest.home_city}
                  arrivalDate={guest.arrival_date}
                  departureDate={guest.departure_date}
                  bio={guest.bio}
                />
              ))}
            </div>
          ) : (
            <p className="border border-dashed border-taupe/25 px-6 py-12 text-center font-sans text-sm text-charcoal/60">
              No guests listed yet. Be the first to add your profile.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
