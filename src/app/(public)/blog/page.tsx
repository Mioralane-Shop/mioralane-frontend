import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BLOG_POSTS } from "@/constants/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Skincare guides, tips and K-beauty insights from Mioralane.",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <div className="max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-widest text-accent">
          The Journal
        </span>
        <h1 className="mt-3 text-4xl font-serif font-medium text-ink">
          Mioralane Blog
        </h1>
        <p className="mt-3 text-ink/50">
          Skincare guides, tips and K-beauty insights.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            className="group overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <Link href={`/blog/${post.slug}`} className="block">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-6">
                <div className="mb-3 flex items-center gap-2 text-xs text-ink/40">
                  <span className="font-medium uppercase tracking-wider text-accent">
                    {post.category}
                  </span>
                  <span>•</span>
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
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
        ))}
      </div>
    </div>
  );
}
