import Link from "next/link";
import { ProductImage } from "@/components/common/product-image";
import type { BlogPostSummary } from "@/types/blog";

/** Shared date formatting for blog cards and article headers. */
export function formatBlogDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/**
 * One blog card, shared by the main listing and the category listing so both
 * stay visually identical.
 */
export function BlogPostCard({ post }: { post: BlogPostSummary }) {
  const date = formatBlogDate(post.publishedAt ?? post.createdAt);

  return (
    <article className="group overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden">
          <ProductImage
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <div className="p-6">
          <div className="mb-3 flex items-center gap-2 text-xs text-ink/40">
            <span className="font-medium uppercase tracking-wider text-accent">
              {post.category}
            </span>
            {date ? (
              <>
                <span>•</span>
                <span>{date}</span>
              </>
            ) : null}
          </div>
          <h2 className="text-lg font-serif font-medium text-ink transition-colors group-hover:text-accent">
            {post.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink/50">
            {post.excerpt}
          </p>
        </div>
      </Link>
    </article>
  );
}
