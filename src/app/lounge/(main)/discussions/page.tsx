import { requireSupabaseClient } from "@/lib/supabase/server";
import type { BoardCategory, GuestRegion } from "@/lib/types/database";
import { RegionFilterLinks } from "@/components/portal/RegionFilter";
import { BoardPostCard } from "@/components/portal/BoardPostCard";
import { BoardPostForm } from "@/components/portal/BoardPostForm";
import { BOARD_CATEGORIES, categoryLabel } from "@/lib/portal/constants";
import { LoungePageHeader } from "@/components/lounge/LoungePageHeader";

export default async function LoungeDiscussionsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; category?: string }>;
}) {
  const params = await searchParams;
  const regionFilter =
    params.region === "us" || params.region === "europe"
      ? (params.region as GuestRegion)
      : "all";
  const categoryFilter = BOARD_CATEGORIES.some(
    (c) => c.value === params.category,
  )
    ? (params.category as BoardCategory)
    : "all";

  let posts = null;
  const countMap = new Map<string, number>();

  try {
    const supabase = await requireSupabaseClient();
    let query = supabase
      .from("board_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (regionFilter !== "all") {
      query = query.eq("region_tag", regionFilter);
    }
    if (categoryFilter !== "all") {
      query = query.eq("category", categoryFilter);
    }

    const { data } = await query;
    posts = data;

    if (posts) {
      const replyCounts = await Promise.all(
        posts.map(async (post) => {
          const { count } = await supabase
            .from("board_replies")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);
          return { id: post.id, count: count ?? 0 };
        }),
      );
      replyCounts.forEach((item) => countMap.set(item.id, item.count));
    }
  } catch {
    posts = null;
  }

  return (
    <div>
      <LoungePageHeader
        title="Discussions"
        script="Ask, share, plan"
        description="Topic-based threads for travel tips, outfits, hotels, and wedding weekend questions."
      />

      <div className="mb-8">
        <RegionFilterLinks basePath="/lounge/discussions" current={regionFilter} />
      </div>

      <div className="mb-10 flex flex-wrap gap-2">
        <a
          href={
            regionFilter !== "all"
              ? `/lounge/discussions?region=${regionFilter}`
              : "/lounge/discussions"
          }
          className={`border px-4 py-2 font-sans text-[0.6rem] uppercase tracking-[0.2em] transition-colors ${
            categoryFilter === "all"
              ? "border-charcoal bg-charcoal text-ivory"
              : "border-taupe/25 text-taupe hover:border-charcoal hover:text-charcoal"
          }`}
        >
          All Topics
        </a>
        {BOARD_CATEGORIES.map((category) => {
          const queryParams = new URLSearchParams();
          if (regionFilter !== "all") queryParams.set("region", regionFilter);
          queryParams.set("category", category.value);
          return (
            <a
              key={category.value}
              href={`/lounge/discussions?${queryParams.toString()}`}
              className={`border px-4 py-2 font-sans text-[0.6rem] uppercase tracking-[0.2em] transition-colors ${
                categoryFilter === category.value
                  ? "border-charcoal bg-charcoal text-ivory"
                  : "border-taupe/25 text-taupe hover:border-charcoal hover:text-charcoal"
              }`}
            >
              {category.label}
            </a>
          );
        })}
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        <section className="space-y-4">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <BoardPostCard
                key={post.id}
                post={{ ...post, reply_count: countMap.get(post.id) ?? 0 }}
              />
            ))
          ) : (
            <p className="border border-dashed border-taupe/25 px-6 py-12 text-center font-sans text-sm text-charcoal/60">
              No threads yet in{" "}
              {categoryFilter === "all" ? "any category" : categoryLabel(categoryFilter)}.
            </p>
          )}
        </section>

        <aside>
          <BoardPostForm />
        </aside>
      </div>
    </div>
  );
}
