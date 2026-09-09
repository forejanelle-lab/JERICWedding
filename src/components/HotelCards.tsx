import Image from "next/image";
import { HOTELS } from "@/lib/constants";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function HotelCards() {
  return (
    <section id="accommodations" className="bg-ivory px-6 py-24 md:px-10 md:py-32 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <SectionHeading
            label="Accommodations"
            script="Where to rest your head"
          />
        </FadeIn>

        <p className="mx-auto mt-8 max-w-2xl text-center font-sans text-base leading-relaxed text-charcoal/70">
          A curated selection of places we love — each chosen for its character,
          comfort, and proximity to our celebration. Book early; September in
          Campania fills quickly.
        </p>

        <div className="mt-16 space-y-20 md:mt-20">
          {HOTELS.map((hotel, index) => (
            <FadeIn key={hotel.name} delay={index * 100}>
              <article
                className={`grid gap-8 lg:grid-cols-2 lg:gap-16 lg:items-center ${
                  index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={hotel.image}
                    alt={hotel.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <h3 className="font-serif text-2xl font-light tracking-[0.08em] text-charcoal uppercase md:text-3xl">
                      {hotel.name}
                    </h3>
                    <span className="font-sans text-sm tracking-widest text-taupe">
                      {hotel.priceRange}
                    </span>
                  </div>

                  <p className="mt-2 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-olive">
                    {hotel.distance}
                  </p>

                  <p className="mt-6 font-sans text-base leading-relaxed text-charcoal/70">
                    {hotel.description}
                  </p>

                  <div className="mt-8 space-y-4 border-t border-taupe/20 pt-8">
                    <div>
                      <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-taupe">
                        Booking
                      </p>
                      <p className="mt-2 font-sans text-sm text-charcoal/70">
                        {hotel.booking}
                      </p>
                    </div>
                    <div>
                      <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-taupe">
                        Transportation
                      </p>
                      <p className="mt-2 font-sans text-sm text-charcoal/70">
                        {hotel.transport}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
