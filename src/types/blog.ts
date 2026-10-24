export type BlogStatus = "draft" | "published";

export type TiptapMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

export type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: TiptapMark[];
};

export type TiptapDoc = {
  type: "doc";
  content?: TiptapNode[];
};

/** A blog article as served by the public API (`GET /api/blog/:slug`). */
export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImage?: string;
  content: TiptapDoc;
  author: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: BlogStatus;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** The list row (`GET /api/blog`), without the document. */
export type BlogPostSummary = Omit<BlogPost, "content">;
