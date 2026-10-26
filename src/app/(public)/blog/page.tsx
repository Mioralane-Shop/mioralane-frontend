import type { Metadata } from "next";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { PageHero } from "@/components/common/page-hero";
import { getPublishedBlogPosts } from "@/lib/blog";
import { PAGE_BOX_CLASSES } from "@/lib/page-layout";

export const metadata: Metadata = {
  title: "Blog",
  description: "Skincare guides, tips and K-beauty insights from Mioralane.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <div className={`${PAGE_BOX_CLASSES} py-12`}>
      <PageHero
        watermarkText="Blog"
        headingText="The Skincare Journal"
        subtitleText="Skincare guides, tips and K-beauty insights."
      />

      {posts.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-ink/10 bg-surface py-16 text-center">
          <h2 className="text-lg font-display font-medium text-ink">New articles are on the way</h2>
          <p className="mt-2 text-sm text-ink/50">Check back soon for skincare guides and tips.</p>
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

