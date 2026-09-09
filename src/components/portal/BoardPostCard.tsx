import Link from "next/link";
import type { BoardPost } from "@/lib/types/database";
import {
  categoryLabel,
  formatDate,
  formatRegion,
} from "@/lib/portal/constants";

type BoardPostCardProps = {
  post: BoardPost & {
    reply_count?: number;
  };
};

export function BoardPostCard({ post }: BoardPostCardProps) {
  return (
    <Link
      href={`/lounge/discussions/${post.id}`}
      className="block border border-taupe/20 bg-ivory p-6 transition-colors hover:border-charcoal/25"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-olive">
          {categoryLabel(post.category)}
        </span>
        {post.region_tag && (
          <span className="font-sans text-[0.55rem] uppercase tracking-[0.2em] text-taupe">
            {formatRegion(post.region_tag)}
          </span>
        )}
      </div>

      <h3 className="mt-3 font-serif text-xl font-light text-charcoal">
        {post.title}
      </h3>

      <p className="mt-3 line-clamp-2 font-sans text-sm leading-relaxed text-charcoal/70">
        {post.body}
      </p>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-sans text-xs text-taupe">
        <span>{post.author_name ?? "Guest"}</span>
        <span>{formatDate(post.created_at.split("T")[0])}</span>
        {typeof post.reply_count === "number" && (
          <span>
            {post.reply_count} repl{post.reply_count === 1 ? "y" : "ies"}
          </span>
        )}
      </div>
    </Link>
  );
}
