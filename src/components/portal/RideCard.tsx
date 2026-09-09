import Link from "next/link";
import type { Ride } from "@/lib/types/database";
import { formatDate, formatRegion } from "@/lib/portal/constants";
import { deleteRideAction } from "@/lib/portal/actions";

type RideCardProps = {
  ride: Ride;
};

export function RideCard({ ride }: RideCardProps) {
  return (
    <article className="border border-taupe/20 bg-ivory p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-gold">
            {ride.type === "offer" ? "Offering a ride" : "Needs a ride"}
          </span>
          <h3 className="mt-2 font-serif text-xl font-light text-charcoal">
            {ride.from_location}
            <span className="mx-2 text-taupe">→</span>
            {ride.to_location}
          </h3>
        </div>
        {ride.region_tag && (
          <span className="border border-olive/20 px-3 py-1 font-sans text-[0.55rem] uppercase tracking-[0.2em] text-olive">
            {formatRegion(ride.region_tag)}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-sans text-xs uppercase tracking-[0.15em] text-taupe">
        <span>{formatDate(ride.ride_date)}</span>
        <span>
          {ride.seats} seat{ride.seats !== 1 ? "s" : ""}
        </span>
        {ride.author_name && <span>{ride.author_name}</span>}
      </div>

      {ride.notes && (
        <p className="mt-4 font-sans text-sm leading-relaxed text-charcoal/70">
          {ride.notes}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-4">
        <Link
          href={`/portal/boards?category=travel_tips`}
          className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-taupe hover:text-charcoal"
        >
          Reply on boards
        </Link>
        <form action={deleteRideAction.bind(null, ride.id)}>
          <button
            type="submit"
            className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-taupe hover:text-red-800"
          >
            Remove
          </button>
        </form>
      </div>
    </article>
  );
}
