import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getPublishedBlogPostBySlug } from "@/lib/blog";
import { renderBlogContent } from "@/lib/blog-renderer";
import { ProductImage } from "@/components/common/product-image";
import { JsonLd } from "@/components/seo/json-ld";
import { generateArticleJsonLd, generateBreadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { decodePathSegment } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodePathSegment((await params).slug);
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    return buildPageMetadata({
      title: "Article not found",
      description: "We could not find that article on the Mioralane blog.",
      path: `/blog/${encodeURIComponent(slug)}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: post.seoTitle?.trim() || post.title,
    description: post.seoDescription?.trim() || post.excerpt,
    path: `/blog/${post.slug}`,
    images: post.coverImage ? [post.coverImage] : [],
    openGraphType: "article",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const slug = decodePathSegment((await params).slug);
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) notFound();

  const publishedAt = post.publishedAt ?? post.createdAt;
  const dateLabel = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <JsonLd
        data={generateArticleJsonLd({
          slug: post.slug,
          title: post.title,
          description: post.seoDescription?.trim() || post.excerpt,
          image: post.coverImage ?? "",
          date: publishedAt ?? "",
        })}
      />
      <JsonLd
        data={generateBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />

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

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-ink/40">
        <span className="font-medium uppercase tracking-wider text-accent">
          {post.category}
        </span>
        {dateLabel ? (
          <>
            <span>•</span>
            <span>{dateLabel}</span>
          </>
        ) : null}
        {post.author ? (
          <>
            <span>•</span>
            <span>{post.author}</span>
          </>
        ) : null}
      </div>

      <h1 className="text-3xl font-display font-medium leading-tight text-ink md:text-4xl">
        {post.title}
      </h1>
      <p className="mt-4 text-lg text-ink/50">{post.excerpt}</p>

      {post.coverImage ? (
        <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-3xl">
          <ProductImage
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 48rem"
            priority
          />
        </div>
      ) : null}

      <div className="mt-10">{renderBlogContent(post.content)}</div>

      <div className="mt-12 rounded-2xl bg-surface p-8 text-center">
        <h2 className="text-lg font-display font-medium text-ink">
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

