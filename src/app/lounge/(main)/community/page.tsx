import { LoungePageHeader } from "@/components/lounge/LoungePageHeader";
import { COMMUNITY_FEED, COMMUNITY_PROMPTS } from "@/lib/lounge/constants";

export default function LoungeCommunityPage() {
  return (
    <div>
      <LoungePageHeader
        title="Community"
        script="Share the excitement"
        description="A curated social feed — prompts first, random posts second."
      />

      <section className="mb-10 border border-taupe/15 bg-forest p-6 text-ivory md:p-8">
        <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-gold/80">
          Today&apos;s Prompt
        </p>
        <h2 className="mt-3 font-serif text-2xl font-light">{COMMUNITY_PROMPTS[0]}</h2>
        <button
          type="button"
          className="mt-6 border border-ivory/30 px-6 py-3 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-ivory"
        >
          Answer Prompt
        </button>
      </section>

      <div className="mb-8 flex flex-wrap gap-2">
        {COMMUNITY_PROMPTS.map((prompt) => (
          <span
            key={prompt}
            className="border border-taupe/20 px-3 py-2 font-sans text-[0.55rem] uppercase tracking-[0.15em] text-taupe"
          >
            {prompt}
          </span>
        ))}
      </div>

      <div className="space-y-4">
        {COMMUNITY_FEED.map((post) => (
          <article key={post.id} className="border border-taupe/15 bg-ivory p-6">
            <p className="font-sans text-[0.55rem] uppercase tracking-[0.2em] text-olive">
              {post.prompt}
            </p>
            <p className="mt-4 font-sans text-base leading-relaxed text-charcoal/80">
              {post.body}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4 font-sans text-xs text-taupe">
              <span>{post.author}</span>
              <span>{post.city}</span>
              <span>{post.time}</span>
              <span>{post.reactions} reactions</span>
              <span>{post.comments} comments</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
