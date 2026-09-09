import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSupabaseClient } from "@/lib/supabase/server";
import { ReplyForm } from "@/components/portal/ReplyForm";
import {
  categoryLabel,
  formatDate,
  formatRegion,
} from "@/lib/portal/constants";
import { deleteBoardPostAction } from "@/lib/portal/actions";

export default async function LoungeDiscussionThreadPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const supabase = await requireSupabaseClient();

  const { data: post } = await supabase
    .from("board_posts")
    .select("*")
    .eq("id", postId)
    .maybeSingle();

  if (!post) notFound();

  const { data: replies } = await supabase
    .from("board_replies")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  return (
    <div>
      <Link
        href="/lounge/discussions"
        className="font-sans text-[0.65rem] uppercase tracking-[0.25em] text-taupe transition-colors hover:text-charcoal"
      >
        ← Back to Discussions
      </Link>

      <article className="mt-8 border border-taupe/20 bg-ivory p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-olive">
            {categoryLabel(post.category)}
          </span>
          {post.region_tag && (
            <span className="font-sans text-[0.55rem] uppercase tracking-[0.2em] text-taupe">
              {formatRegion(post.region_tag)}
            </span>
          )}
        </div>

        <h1 className="mt-4 font-serif text-3xl font-light text-charcoal md:text-4xl">
          {post.title}
        </h1>

        <p className="mt-4 font-sans text-xs uppercase tracking-[0.15em] text-taupe">
          {post.author_name ?? "Guest"} ·{" "}
          {formatDate(post.created_at.split("T")[0])}
        </p>

        <p className="mt-8 whitespace-pre-wrap font-sans text-base leading-relaxed text-charcoal/80">
          {post.body}
        </p>

        <form action={deleteBoardPostAction.bind(null, post.id)} className="mt-8">
          <button
            type="submit"
            className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-taupe hover:text-red-800"
          >
            Delete Thread
          </button>
        </form>
      </article>

      <section className="mt-12">
        <h2 className="mb-6 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-olive">
          Replies ({replies?.length ?? 0})
        </h2>

        <div className="space-y-4">
          {replies?.map((reply) => (
            <article
              key={reply.id}
              className="border border-taupe/15 bg-cream px-6 py-5"
            >
              <p className="font-sans text-xs uppercase tracking-[0.15em] text-taupe">
                {reply.author_name ?? "Guest"} ·{" "}
                {formatDate(reply.created_at.split("T")[0])}
              </p>
              <p className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-charcoal/80">
                {reply.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8">
          <ReplyForm postId={postId} />
        </div>
      </section>
    </div>
  );
}
