import Link from "next/link";
import { LoungePageHeader } from "@/components/lounge/LoungePageHeader";
import { GAME_CATEGORIES, LOUNGE_GAMES } from "@/lib/lounge/constants";

export default async function LoungeGamesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const category = params.category ?? "all";
  const games =
    category === "all"
      ? LOUNGE_GAMES
      : LOUNGE_GAMES.filter((game) => game.category === category);

  return (
    <div>
      <LoungePageHeader
        title="Games & Fun"
        script="Play your way into the group"
        description="Quizzes, icebreakers, polls, and predictions — all designed to help you meet people before Italy."
      />

      <div className="mb-10 flex flex-wrap gap-2">
        {GAME_CATEGORIES.map((option) => {
          const href =
            option.value === "all"
              ? "/lounge/games"
              : `/lounge/games?category=${option.value}`;
          const active = category === option.value;
          return (
            <Link
              key={option.value}
              href={href}
              className={`border px-4 py-2 font-sans text-[0.6rem] uppercase tracking-[0.2em] transition-colors ${
                active
                  ? "border-charcoal bg-charcoal text-ivory"
                  : "border-taupe/25 text-taupe hover:border-charcoal hover:text-charcoal"
              }`}
            >
              {option.label}
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {games.map((game) => (
          <Link
            key={game.id}
            href={game.href}
            className={`group border bg-ivory p-6 transition-all duration-500 hover:shadow-[0_16px_48px_rgba(28,28,28,0.08)] ${
              game.featured
                ? "border-forest/20 hover:border-forest/40"
                : "border-taupe/15 hover:border-charcoal/20"
            }`}
          >
            <p className="font-sans text-[0.55rem] uppercase tracking-[0.25em] text-olive">
              {game.category}
            </p>
            <h2 className="mt-3 font-serif text-2xl font-light tracking-[0.06em] text-charcoal uppercase">
              {game.title}
            </h2>
            <p className="mt-3 font-sans text-sm leading-relaxed text-charcoal/65">
              {game.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-4 font-sans text-xs text-taupe">
              <span>{game.players} playing</span>
              <span>+{game.points} points</span>
            </div>
            <span className="mt-6 inline-flex items-center gap-3 font-sans text-[0.6rem] uppercase tracking-[0.2em] text-charcoal/70 transition-all group-hover:gap-4">
              Play
              <span className="block h-px w-6 bg-current" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
