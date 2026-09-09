"use client";

import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";
import { EditImage } from "@/components/site/EditImage";
import { EditText } from "@/components/site/EditText";
import { PageHeader, SectionWrap } from "@/components/site/PageHeader";
import { AIRPORTS, HOTELS } from "@/lib/hub/content";
import { canSeePage } from "@/lib/hub/access";
import { useHub } from "@/lib/hub/store";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function TravelPage() {
  const { t } = useI18n();
  const { state } = useHub();
  const showRides = canSeePage(state, "/rides");
  const showThings = canSeePage(state, "/things-to-do");
  return (
    <main className="pt-[calc(4.75rem+env(safe-area-inset-top))] md:pt-[3.4rem]">
      <SectionWrap className="bg-ivory !py-8 md:!py-10">
        <PageHeader
          compact
          editId="travel"
          eyebrow="Italy, made less mysterious"
          title="Travel & Stay"
          description="Airports, trains, hotels, and how to actually get to Casale dei Mascioni without a twelve-message thread."
        />
      </SectionWrap>

      <SectionWrap className="bg-cream !py-10 md:!py-14">
        <EditText id="travel.getting" as="h2" className="mb-6 font-serif text-3xl font-light tracking-[0.1em] uppercase">
          Getting here
        </EditText>
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {AIRPORTS.map((airport) => (
            <article key={airport.code} className="soft-card p-6">
              <p className="font-sans text-[0.65rem] uppercase tracking-[0.25em] text-olive">{airport.code}</p>
              <EditText id={`travel.airport.${airport.code}.name`} as="h3" className="mt-3 font-serif text-2xl font-light">
                {airport.name}
              </EditText>
              <EditText id={`travel.airport.${airport.code}.note`} as="p" multiline className="mt-4 font-sans text-sm leading-relaxed text-charcoal/70">
                {airport.note}
              </EditText>
              <EditText id={`travel.airport.${airport.code}.from`} as="p" className="mt-3 font-sans text-sm text-taupe">
                {airport.from}
              </EditText>
            </article>
          ))}
        </div>
      </SectionWrap>

      <SectionWrap className="bg-ivory">
        <EditText id="travel.airports" as="h2" className="mb-4 font-serif text-3xl font-light tracking-[0.1em] uppercase">
          Airports
        </EditText>
        <EditText id="travel.airports.body" as="p" multiline className="mb-10 max-w-2xl font-sans text-charcoal/70">
          If you can, fly into Naples. If the fare to Rome is kinder, take Frecciarossa to Napoli Centrale (about 70 minutes) and continue by car or shuttle.
        </EditText>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-taupe/15">
            <iframe
              title={t("travel.mapTitle")}
              src="https://www.openstreetmap.org/export/embed.html?bbox=13.8%2C40.2%2C15.5%2C41.5&layer=mapnik&marker=41.08%2C14.28"
              className="h-80 w-full"
              loading="lazy"
            />
          </div>
          <div className="space-y-6">
            {[
              ["Train", "Rome → Naples on Frecciarossa or Italo. Book seats now for early September."],
              ["Taxi", "NAP official taxis to the Caserta area run roughly €60–80. Agree before you ride."],
              ["Rental car", "Useful for the coast; less necessary if you're staying in Naples and using shuttles."],
              ["Shuttles", "Wedding-event coaches from recommended hotels. Times in Updates closer to the date."],
            ].map(([title, body]) => (
              <article key={title}>
                <EditText id={`travel.mode.${title}.title`} as="h3" className="font-sans text-[0.65rem] uppercase tracking-[0.25em] text-olive">
                  {title}
                </EditText>
                <EditText id={`travel.mode.${title}.body`} as="p" multiline className="mt-2 font-sans text-sm leading-relaxed text-charcoal/70">
                  {body}
                </EditText>
              </article>
            ))}
          </div>
        </div>
      </SectionWrap>

      <SectionWrap className="bg-cream">
        <EditText id="travel.stay" as="h2" className="mb-8 font-serif text-3xl font-light tracking-[0.1em] uppercase">
          Where to stay
        </EditText>
        <article className="mb-12 rounded-2xl border border-olive/20 bg-ivory px-6 py-8 md:px-8">
          <EditText id="travel.coupleStay.kicker" as="p" className="label-caps">
            Where the bride and groom are staying
          </EditText>
          <EditText id="travel.coupleStay.place" as="h3" className="mt-3 font-serif text-3xl font-light uppercase">
            Casale dei Mascioni
          </EditText>
          <EditText id="travel.coupleStay.body" as="p" multiline className="mt-3 max-w-2xl font-sans leading-relaxed text-charcoal/70">
            We'll be on the estate for the wedding weekend — same place as the ceremony.
          </EditText>
        </article>
        <div className="mb-10 flex items-center gap-4">
          <span className="h-px flex-1 bg-taupe/20" />
          <EditText id="travel.stay.guests" as="p" className="font-sans text-[0.62rem] uppercase tracking-[0.22em] text-taupe">
            Hotels for guests
          </EditText>
          <span className="h-px flex-1 bg-taupe/20" />
        </div>
        <div className="space-y-16">
          {HOTELS.map((hotel, index) => (
            <FadeIn key={hotel.name}>
              <article className={`grid items-center gap-8 lg:grid-cols-2 ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <EditImage id={`travel.hotel.${index}.image`} src={hotel.image} alt={hotel.name} fill className="object-cover" />
                </div>
                <div>
                  <EditText id={`travel.hotel.${index}.meta`} as="p" className="label-caps">
                    {`${hotel.area} · ${hotel.priceRange}`}
                  </EditText>
                  <EditText id={`travel.hotel.${index}.name`} as="h3" className="mt-2 font-serif text-3xl font-light uppercase">
                    {hotel.name}
                  </EditText>
                  <EditText id={`travel.hotel.${index}.distance`} as="p" className="mt-2 font-sans text-sm text-taupe">
                    {hotel.distance}
                  </EditText>
                  <EditText id={`travel.hotel.${index}.description`} as="p" multiline className="mt-4 font-sans leading-relaxed text-charcoal/70">
                    {hotel.description}
                  </EditText>
                  <EditText id={`travel.hotel.${index}.booking`} as="p" multiline className="mt-4 font-sans text-sm text-charcoal/60">
                    {hotel.booking}
                  </EditText>
                  <EditText id={`travel.hotel.${index}.transport`} as="p" multiline className="mt-2 font-sans text-sm text-charcoal/60">
                    {hotel.transport}
                  </EditText>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
        {showRides ? (
        <p className="mt-12 font-sans text-sm text-taupe">
          {t("travel.rideLead")}{" "}
          <Link href="/rides" className="text-olive underline-offset-4 hover:underline">
            {t("travel.rideBoard")}
          </Link>
          .
        </p>
        ) : null}
      </SectionWrap>

      <SectionWrap className="bg-ivory">
        <EditText id="travel.local" as="h2" className="mb-8 font-serif text-3xl font-light tracking-[0.1em] uppercase">
          Local area
        </EditText>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["Caserta", "20 minutes. Royal palace, gardens, easy lunch."],
            ["Naples", "35–45 minutes. Pizza, palazzi, airport."],
            ["Sorrento / coast", "About an hour. Stay if you're making a holiday of it."],
          ].map(([title, body]) => (
            <article key={title} className="soft-card p-6">
              <EditText id={`travel.local.${title}.title`} as="h3" className="font-serif text-2xl">
                {title}
              </EditText>
              <EditText id={`travel.local.${title}.body`} as="p" className="mt-3 font-sans text-sm text-charcoal/70">
                {body}
              </EditText>
            </article>
          ))}
        </div>
        {showThings ? (
        <Link href="/things-to-do" className="btn-primary mt-10">
          {t("travel.thingsToDo")}
        </Link>
        ) : null}
      </SectionWrap>
    </main>
  );
}
