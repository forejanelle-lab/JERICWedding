import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

const GALLERY_PLACEHOLDERS = [
  { label: "Casale dei Mascioni", tone: "from-olive/20 to-forest/30" },
  { label: "Campania Light", tone: "from-gold/15 to-taupe/25" },
  { label: "The Coast", tone: "from-beige to-olive/15" },
  { label: "Evening Glow", tone: "from-charcoal/20 to-olive/25" },
  { label: "Together", tone: "from-cream to-gold/10" },
  { label: "Italian Summer", tone: "from-olive/10 to-beige" },
] as const;

export function GallerySection() {
  return (
    <section id="gallery" className="bg-ivory px-6 py-24 md:px-10 md:py-32 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <SectionHeading
            label="Gallery"
            script="Moments & inspiration"
            className="mb-14"
          />
        </FadeIn>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GALLERY_PLACEHOLDERS.map((item, index) => (
            <FadeIn key={item.label} delay={index * 80}>
              <div
                className={`group relative aspect-[4/5] overflow-hidden bg-gradient-to-br ${item.tone}`}
              >
                <div className="absolute inset-0 flex items-end p-6">
                  <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-charcoal/50 transition-colors group-hover:text-charcoal/70">
                    {item.label}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={400}>
          <p className="mx-auto mt-10 max-w-lg text-center font-sans text-sm text-charcoal/60">
            Wedding photos will live here after the celebration. Guest Lounge members can
            also share photos through{" "}
            <Link href="/lounge/login" className="text-olive underline-offset-4 hover:underline">
              photo challenges
            </Link>
            .
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
