import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { PageHero } from "@/components/common/page-hero";
import { getPublishedBlogPostsByCategory } from "@/lib/blog";
import { PAGE_BOX_CLASSES } from "@/lib/page-layout";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { decodePathSegment } from "@/lib/utils";

interface Props {
  params: Promise<{ category: string }>;
}

/** `routine` → `Routine`, used only when no article supplies the real label. */
function humanize(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|\s)\S/g, (char) => char.toUpperCase());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = decodePathSegment((await params).category).trim().toLowerCase();
  const label = humanize(category);

  return buildPageMetadata({
    title: `${label} Articles`,
    description: `${label} routines and skincare guides from the Mioralane blog.`,
    path: `/blog/category/${encodeURIComponent(category)}`,
  });
}

export default async function BlogCategoryPage({ params }: Props) {
  const category = decodePathSegment((await params).category).trim().toLowerCase();
  const posts = await getPublishedBlogPostsByCategory(category);

  // The stored label ("Routine") is authoritative; the slug is only the lookup key.
  const label = posts[0]?.category ?? humanize(category);

  return (
    <div className={`${PAGE_BOX_CLASSES} py-12`}>
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink/50 transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" />
        All articles
      </Link>

      <div className="mt-6">
        <PageHero
          watermarkText={label}
          headingText={label}
          subtitleText={
            posts.length === 0
              ? "Nothing has been published in this category yet."
              : `Every ${label.toLowerCase()} article we have published.`
          }
        />
      </div>

      {posts.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-ink/10 bg-surface py-16 text-center">
          <h2 className="text-lg font-display font-medium text-ink">
            {`No ${label.toLowerCase()} articles yet`}
          </h2>
          <p className="mt-2 text-sm text-ink/50">
            We have not published anything in this category yet. New guides are on the way.
          </p>
          <Link
            href="/blog"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Browse all articles
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
