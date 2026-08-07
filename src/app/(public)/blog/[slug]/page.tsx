import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getBlogPost } from "@/constants/blog";

interface Props {
  params: { slug: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getBlogPost(params.slug);
  return {
    title: post?.title ?? "Blog Post",
    description: post?.excerpt,
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-ink/50">
        <Link href="/" className="transition-colors hover:text-ink">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/blog" className="transition-colors hover:text-ink">
          Blog
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink">{post.category}</span>
      </nav>

      <div className="mb-4 flex items-center gap-2 text-xs text-ink/40">
        <span className="font-medium uppercase tracking-wider text-accent">
          {post.category}
        </span>
        <span>•</span>
        <span>{post.date}</span>
        <span>•</span>
        <span>{post.readTime}</span>
      </div>

      <h1 className="text-3xl font-serif font-medium leading-tight text-ink md:text-4xl">
        {post.title}
      </h1>
      <p className="mt-4 text-lg text-ink/50">{post.excerpt}</p>

      <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-3xl">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 48rem"
        />
      </div>

      <div className="mt-10 space-y-8">
        {post.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-3 text-xl font-serif font-medium text-ink">
              {section.heading}
            </h2>
            <p className="leading-relaxed text-ink/60">{section.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-surface p-8 text-center">
        <h2 className="text-lg font-serif font-medium text-ink">
          Loved this read?
        </h2>
        <p className="mt-2 text-sm text-ink/50">
          Explore authentic Korean skincare that works for your skin.
        </p>
        <Link
          href="/shop"
          className="mt-5 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent"
        >
          Shop Now
        </Link>
      </div>
    </div>
  );
}
