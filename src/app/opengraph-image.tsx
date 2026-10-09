import { ImageResponse } from "next/og";

/**
 * The site-wide Open Graph / Twitter card, generated at build time.
 *
 * ## Why a generated image and not a PNG in `public/`
 *
 * The previous card was `/slider/slider1.png` — a 2103×748 hero crop (2.8:1)
 * pressed into a 1.91:1 slot, so every platform cropped it arbitrarily. A real
 * card needs to be exactly 1200×630 with the brand at a legible size, and
 * `next/og` (Satori → resvg, bundled with Next — no new dependency) produces one
 * from the same brand tokens the storefront uses.
 *
 * The file convention means Next wires `og:image` and `twitter:image` for this
 * segment automatically. Route segments that set their own
 * `openGraph.images` — every page built by `src/lib/seo/metadata.ts` — override
 * it, which is what we want for product photography.
 *
 * ## Satori's constraints, which are not CSS's
 *
 * Every element with more than one child needs an explicit `display: "flex"`,
 * there is no grid, and `<br>` does not exist (headline lines are separate
 * elements). Colours use `rgba()` rather than 8-digit hex, which Satori's colour
 * parser does not accept.
 *
 * Fonts: the face ImageResponse bundles renders the bold headline correctly, so
 * no font file is passed. The local `src/app/fonts/GeistVF.woff` was tried first
 * and **crashed the prerender** (`TypeError: Cannot read properties of undefined
 * (reading '256')`) — it is a variable WOFF, which Satori cannot parse. Do not
 * reintroduce it without checking that the build still exits 0.
 */
export const alt = "Mioralane — authentic Korean skincare, delivered across Bangladesh";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PINK = "#FB6F92";
const GREEN = "#006400";
const INK = "#1A1A1A";
const CREAM = "#FAF8F6";
const MUTED = "#6B6B6B";

const BRANDS = ["COSRX", "Beauty of Joseon", "ANUA", "SKIN1004", "Purito"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: CREAM,
          padding: "64px 72px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Pink accent wash, top-right, echoing the logo petal. */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -140,
            width: 520,
            height: 520,
            borderRadius: 9999,
            backgroundImage: `linear-gradient(135deg, ${PINK}38, ${PINK}00)`,
            display: "flex",
          }}
        />

        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              display: "flex",
              width: 62,
              height: 62,
              borderRadius: 9999,
              border: `11px solid ${PINK}`,
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 46, fontWeight: 700, color: INK, letterSpacing: -1.5, lineHeight: 1 }}>
              Mioralane
            </div>
            <div style={{ fontSize: 19, color: GREEN, letterSpacing: 4, marginTop: 6 }}>
              KOREAN SKINCARE
            </div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 78, fontWeight: 700, color: INK, letterSpacing: -2.5, lineHeight: 1.06 }}>
            Authentic K-beauty,
          </div>
          <div style={{ fontSize: 78, fontWeight: 700, color: INK, letterSpacing: -2.5, lineHeight: 1.06 }}>
            curated for your routine.
          </div>
          <div style={{ fontSize: 27, color: MUTED, marginTop: 22 }}>
            Batch-verified from Seoul · Delivered across Bangladesh
          </div>
        </div>

        {/* Brand chips + footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {BRANDS.map((brand) => (
              <div
                key={brand}
                style={{
                  display: "flex",
                  padding: "10px 20px",
                  borderRadius: 9999,
                  border: `1px solid rgba(0, 100, 0, 0.18)`,
                  backgroundColor: "#FFFFFF",
                  color: GREEN,
                  fontSize: 20,
                }}
              >
                {brand}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 700, color: PINK }}>mioralane.com</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
