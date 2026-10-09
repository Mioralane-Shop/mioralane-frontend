/**
 * Renders a JSON-LD graph as an inline `<script type="application/ld+json">`.
 *
 * ## Why there is no `dangerouslySetInnerHTML`
 *
 * The usual recipe for structured data is
 * `dangerouslySetInnerHTML={{ __html: json }}`, but this repository treats
 * `dangerouslySetInnerHTML` as a hard invariant violation —
 * `scripts/verify-no-html-sinks.ts` fails the build if the identifier appears
 * anywhere in `src/`, and it has a twin in the admin repo. A structured-data
 * block is not worth carving an exception for.
 *
 * It does not have to be. React renders the *text children* of a `<script>`
 * element verbatim (it is a raw-text element, so it is exempt from the HTML
 * escaping applied to ordinary text) — verified against the installed
 * `react-dom/server`. Combined with `serializeJsonLd`, which escapes `<` to
 * `\u003c`, the payload cannot break out of the element.
 */
import { serializeJsonLd } from "@/lib/seo/json-ld";

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json">{serializeJsonLd(data)}</script>;
}
