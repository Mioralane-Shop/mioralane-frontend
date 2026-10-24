/**
 * Server-side data access for the storefront blog.
 *
 * Deliberately stricter than `lib/seo/data.ts`: the blog pages must NOT fall back
 * to the bundled constants. An article page that renders an old hard-coded post
 * after the API moved on would be wrong content served as if current, so the
 * pages show their empty state instead. (The sitemap keeps the bundled fallback
 * for the offline CI path — see `getSeoBlogPosts` in `lib/seo/data.ts`.)
 */
import type { BlogPost, BlogPostSummary } from "@/types/blog";

function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
}

async function fetchJson(path: string): Promise<unknown | null> {
  const base = apiBase();
  if (!base) {
    return null;
  }

  try {
    const response = await fetch(`${base}${path}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(4000),
      // Never cache: publishing from the admin must be visible immediately, and
      // a cached 404 for a slug that was a draft moments ago is indistinguishable
      // from a real missing article.
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

function isSummary(value: unknown): value is BlogPostSummary {
  const candidate = value as Partial<BlogPostSummary> | null | undefined;
  return (
    !!candidate &&
    typeof candidate === "object" &&
    typeof candidate.slug === "string" &&
    candidate.slug.length > 0 &&
    typeof candidate.title === "string" &&
    candidate.title.length > 0
  );
}

export async function getPublishedBlogPosts(): Promise<BlogPostSummary[]> {
  const payload = await fetchJson("/blog");
  const remote = (payload as { posts?: unknown } | null)?.posts;
  return Array.isArray(remote) ? remote.filter(isSummary) : [];
}

/**
 * Published articles of one category. `category` may be the stored label
 * (`Routine`) or its slug (`routine`) — the API normalises both. An unknown
 * category yields `[]`, never the unfiltered feed.
 */
export async function getPublishedBlogPostsByCategory(category: string): Promise<BlogPostSummary[]> {
  const value = category.trim();
  if (!value) {
    return [];
  }

  const payload = await fetchJson(`/blog?category=${encodeURIComponent(value)}`);
  const remote = (payload as { posts?: unknown } | null)?.posts;
  return Array.isArray(remote) ? remote.filter(isSummary) : [];
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!slug) {
    return null;
  }

  const payload = await fetchJson(`/blog/${encodeURIComponent(slug)}`);
  const post = (payload as { post?: unknown } | null)?.post;

  if (!post || typeof post !== "object" || (post as { slug?: unknown }).slug !== slug) {
    return null;
  }

  return post as BlogPost;
}
