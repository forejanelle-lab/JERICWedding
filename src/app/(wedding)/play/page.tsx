"use client";

import Link from "next/link";
import { EditText } from "@/components/site/EditText";
import { PageHeader, SectionWrap } from "@/components/site/PageHeader";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const GAMES = [
  { href: "/play/know-us", title: "How well do you know us?", blurb: "Who said I love you first, who takes longer to get ready, who planned the trip." },
  { href: "/play/trivia", title: "Wedding trivia", blurb: "Janelle, Eric, Italy, family, and the weekend itself." },
  { href: "/play/predictions", title: "Predictions", blurb: "Who cries first, last song standing — answers after the wedding." },
  { href: "/play/photos", title: "Guess the photo", blurb: "Childhood energy, engagement light, travel stills." },
];

export default function PlayPage() {
  const { t } = useI18n();
  return (
    <main className="pt-[calc(4.75rem+env(safe-area-inset-top))] md:pt-[3.4rem]">
      <SectionWrap className="bg-ivory !py-8 md:!py-10">
        <PageHeader
          compact
          editId="play"
          eyebrow="A mini game room"
          title="Let's Play"
          description="Play for points, not popularity. Appear on the leaderboard only if you want to."
        />
        <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-2">
          {GAMES.map((game) => (
            <Link key={game.href} href={game.href} className="soft-card card-lift p-8">
              <EditText id={`play.game.${game.href}.title`} as="h2" className="font-serif text-2xl font-light tracking-[0.06em] uppercase">
                {game.title}
              </EditText>
              <EditText id={`play.game.${game.href}.blurb`} as="p" multiline className="mt-3 font-sans text-sm leading-relaxed text-charcoal/70">
                {game.blurb}
              </EditText>
            </Link>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link href="/leaderboard" className="btn-secondary">
            {t("play.leaderboard")}
          </Link>
        </div>
      </SectionWrap>
    </main>
  );
}
