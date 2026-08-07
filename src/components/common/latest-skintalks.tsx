import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "@/constants/blog";

export function LatestSkintalks() {
  const posts = BLOG_POSTS.slice(0, 3);

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Heading with flanking lines */}
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-ink/20 sm:w-16" />
          <h2 className="text-xl font-bold uppercase tracking-tight text-ink sm:text-2xl">
            Latest Skintalks
          </h2>
          <span className="h-px w-10 bg-ink/20 sm:w-16" />
        </div>
        <div className="mt-3 text-center">
          <Link
            href="/blog"
            className="text-sm font-medium text-ink/50 transition-colors hover:text-accent"
          >
            View all blogs →
          </Link>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-base font-bold uppercase tracking-tight text-ink transition-colors group-hover:text-accent md:text-lg">
                  {post.title}
                </h3>
                <p className="mt-1.5 text-xs text-ink/40">{post.date}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/50">
                  {post.excerpt}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors group-hover:text-accent">
                  View Details <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
