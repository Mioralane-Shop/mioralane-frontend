import { Fragment, type ReactNode } from "react";
import { ProductImage } from "@/components/common/product-image";
import type { TiptapDoc, TiptapNode } from "@/types/blog";

/**
 * Renders a validated Tiptap JSON document as semantic HTML — never as a raw
 * HTML string. Unknown node and mark types are dropped, and links are only
 * rendered when their href passes the same safety check the backend applies.
 */

const asString = (value: unknown): string => (typeof value === "string" ? value : "");

/** Only http(s) or site-relative links are rendered. Everything else is text. */
function safeHref(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const href = value.trim();
  if (!href) return null;

  if (/^(https?:\/\/|\/(?!\/)|#)/i.test(href)) {
    return href;
  }

  return null;
}

function textAlign(attrs: Record<string, unknown> | undefined): "left" | "center" | "right" | undefined {
  const value = attrs?.textAlign;
  if (value === "center" || value === "right") return value;
  return undefined;
}

const BLOCK_STYLES = {
  paragraph: "my-5 leading-[1.8] text-ink/70",
  h1: "mt-10 mb-4 font-serif text-3xl font-medium text-ink md:text-4xl",
  h2: "mt-8 mb-3 font-serif text-2xl font-medium text-ink",
  h3: "mt-6 mb-2 font-serif text-xl font-medium text-ink",
} as const;

function wrapMark(markType: string, attrs: Record<string, unknown> | undefined, children: ReactNode): ReactNode {
  switch (markType) {
    case "bold":
      return <strong>{children}</strong>;
    case "italic":
      return <em>{children}</em>;
    case "underline":
      return <u>{children}</u>;
    case "strike":
      return <s>{children}</s>;
    case "code":
      return <code className="rounded bg-ink/[0.05] px-1.5 py-0.5 font-mono text-sm">{children}</code>;
    case "link": {
      const href = safeHref(attrs?.href);
      if (!href) return children;
      const external = /^https?:\/\//i.test(href);
      return (
        <a
          href={href}
          className="text-accent underline underline-offset-2 transition-colors hover:text-accent-dark"
          {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
        >
          {children}
        </a>
      );
    }
    default:
      return children;
  }
}

function renderInline(nodes: TiptapNode[] | undefined): ReactNode[] {
  if (!Array.isArray(nodes)) return [];

  return nodes.flatMap((node, index) => {
    if (node.type === "text") {
      let content: ReactNode = typeof node.text === "string" ? node.text : "";
      for (const mark of node.marks ?? []) {
        content = wrapMark(mark.type, mark.attrs, content);
      }
      return [content];
    }

    if (node.type === "hardBreak") {
      return [<br key={index} />];
    }

    if (node.type === "image") {
      return renderImage(node);
    }

    return [];
  });
}

function renderImage(node: TiptapNode): ReactNode {
  const src = asString(node.attrs?.src);
  if (!src) return null;

  const width = Number(node.attrs?.width) > 0 ? Number(node.attrs?.width) : undefined;
  const height = Number(node.attrs?.height) > 0 ? Number(node.attrs?.height) : undefined;
  const alt = asString(node.attrs?.alt);
  const caption = asString(node.attrs?.caption).trim() || null;

  return (
    <figure className="my-8" key={src + (caption ?? "")}>
      <div className="overflow-hidden rounded-2xl">
        <ProductImage
          src={src}
          alt={alt}
          width={width ?? 800}
          height={height ?? 450}
          className="h-auto w-full"
          sizes="(max-width: 768px) 100vw, 48rem"
          loading="lazy"
        />
      </div>
      {caption ? (
        <figcaption className="mt-2 text-center text-sm text-ink/50">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

function renderBlock(node: TiptapNode, index: number): ReactNode {
  switch (node.type) {
    case "paragraph":
      return (
        <p key={index} className={BLOCK_STYLES.paragraph} style={textAlign(node.attrs) ? { textAlign: textAlign(node.attrs) } : undefined}>
          {renderInline(node.content)}
        </p>
      );
    case "heading": {
      const level = Number(node.attrs?.level);
      if (level === 1) return <h1 key={index} className={BLOCK_STYLES.h1}>{renderInline(node.content)}</h1>;
      if (level === 3) return <h3 key={index} className={BLOCK_STYLES.h3}>{renderInline(node.content)}</h3>;
      return <h2 key={index} className={BLOCK_STYLES.h2}>{renderInline(node.content)}</h2>;
    }
    case "bulletList":
      return (
        <ul key={index} className="my-5 list-disc space-y-2 pl-6 text-ink/70">
          {renderListItems(node.content)}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={index} className="my-5 list-decimal space-y-2 pl-6 text-ink/70">
          {renderListItems(node.content)}
        </ol>
      );
    case "blockquote":
      return (
        <blockquote key={index} className="my-6 border-l-2 border-accent pl-5 italic text-ink/60">
          {Array.isArray(node.content)
            ? node.content.map((child, childIndex) =>
                child.type === "paragraph" ? (
                  <p key={childIndex} className="my-2 leading-[1.8]">
                    {renderInline(child.content)}
                  </p>
                ) : (
                  renderBlock(child, childIndex)
                ),
              )
            : renderInline(node.content)}
        </blockquote>
      );
    case "horizontalRule":
      return <hr key={index} className="my-8 border-border" />;
    case "image":
      return renderImage(node);
    default:
      return null;
  }
}

function renderListItems(nodes: TiptapNode[] | undefined): ReactNode[] {
  if (!Array.isArray(nodes)) return [];

  return nodes.map((node, index) => {
    if (node.type !== "listItem") return null;

    const children = node.content ?? [];

    // A Tiptap list item's content is BLOCK content (paragraphs and nested
    // lists), not inline text. Calling `renderInline` here was why published
    // lists rendered as empty numbered/bulleted rows.
    return (
      <li key={index}>
        {children.map((child, childIndex) => {
          if (child.type === "paragraph") {
            return (
              <p key={childIndex} className="my-0 leading-[1.8]">
                {renderInline(child.content)}
              </p>
            );
          }

          if (child.type === "text" || child.type === "hardBreak") {
            return <Fragment key={childIndex}>{renderInline([child])}</Fragment>;
          }

          return renderBlock(child, childIndex);
        })}
      </li>
    );
  });
}

export function renderBlogContent(doc: TiptapDoc | null | undefined): ReactNode[] {
  const content = doc?.content;
  if (!Array.isArray(content) || content.length === 0) {
    return [];
  }

  return content.map((node, index) => renderBlock(node, index));
}
