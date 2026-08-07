import type { Product } from "@/types/product";

// Product photo mapping (Unsplash, via UnsplashX MCP).
// Attributions (Unsplash requires credit):
//  - catalog-serum.jpg: Photo by Maria Lupan (unsplash.com/@luandmario)
//  - catalog-sun.jpg:   Photo by Tuan Nguyen (unsplash.com/@anhtuannl)
//  - catalog-cream.jpg: Photo by pmv chamara (unsplash.com/@pmvch)
//  - catalog-cleanser.jpg: Photo by Ela De Pure (unsplash.com/@eladepure)
//  - catalog-mask.jpg:  Photo by Alexander Grey (unsplash.com/@sharonmccutcheon)
// Swap for the official product photos once available.
const IMG = {
  sun: "/images/catalog-sun.jpg",
  serum: "/images/catalog-serum.jpg",
  oil: "/images/catalog-cleanser.jpg",
  cleanser: "/images/catalog-cleanser.jpg",
  cream: "/images/catalog-cream.jpg",
  mask: "/images/catalog-mask.jpg",
  essence: "/images/catalog-serum.jpg",
  glow: "/images/catalog-serum.jpg",
};

type P = Partial<Product> & {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  images: string[];
};

function p(data: P): Product {
  return {
    description: data.description ?? "",
    tags: data.tags ?? [],
    rating: data.rating ?? 4.6,
    reviewCount: data.reviewCount ?? 10,
    stock: data.stock ?? 20,
    isNew: data.isNew ?? true,
    isBestSeller: data.isBestSeller ?? false,
    createdAt: data.createdAt ?? "2026-08-01",
    ...data,
  } as Product;
}

export const CATALOG_2026_PRODUCTS: Product[] = [
  // ─── SKIN1004 ─────────────────────────────────────────────
  p({
    id: "skin1004-hyalu-cica-sun-mini",
    slug: "hyalu-cica-water-fit-sun-serum-mini-15ml",
    name: "Madagascar Centella Hyalu-Cica Water Fit Sun Serum 15ml (Mini)",
    description:
      "Mini size of the viral water-fit sun serum — SPF50+ PA++++ with hyaluronic acid and cica. Lightweight, zero white cast.",
    price: 650,
    category: "sun-care",
    brand: "SKIN1004",
    images: [IMG.sun],
    concerns: ["UV Protection", "Hydration"],
    volume: "15ml",
    stock: 40,
  }),
  p({
    id: "skin1004-hyalu-cica-sun-50",
    slug: "hyalu-cica-water-fit-sun-serum-spf50-50ml",
    name: "Madagascar Centella Hyalu-Cica Water Fit Sun Serum SPF50+ PA++++ 50ml",
    description:
      "A water-fit, hydrating sunscreen with a serum-like texture. No white cast, sits perfectly under makeup.",
    price: 1650,
    category: "sun-care",
    brand: "SKIN1004",
    images: ["/images/skin1004-sun-serum-50ml.jpg"],
    concerns: ["UV Protection", "Hydration"],
    volume: "50ml",
    stock: 60,
    isBestSeller: true,
  }),
  p({
    id: "skin1004-hyalu-cica-sun-100",
    slug: "hyalu-cica-water-fit-sun-serum-spf50-100ml",
    name: "Madagascar Centella Hyalu-Cica Water Fit Sun Serum SPF50+ PA++++ 100ml",
    description:
      "Value-size of the best-selling water-fit sun serum. Everyday UV protection with a dewy, non-sticky finish.",
    price: 2800,
    category: "sun-care",
    brand: "SKIN1004",
    images: [IMG.sun],
    concerns: ["UV Protection", "Hydration"],
    volume: "100ml",
    stock: 35,
  }),
  p({
    id: "skin1004-probio-ampoule-30",
    slug: "probio-cica-intensive-ampoule-30ml",
    name: "SKIN1004 Madagascar Centella Probio-Cica Intensive Ampoule 30ml",
    description:
      "Soothing ampoule with centella and probiotics that repairs the skin barrier and calms redness.",
    price: 1450,
    category: "serums",
    brand: "SKIN1004",
    images: [IMG.serum],
    concerns: ["Redness", "Sensitive", "Barrier Repair"],
    volume: "30ml",
    stock: 45,
  }),
  p({
    id: "skin1004-probio-ampoule-50",
    slug: "probio-cica-intensive-ampoule-50ml",
    name: "SKIN1004 Madagascar Centella Probio-Cica Intensive Ampoule 50ml",
    description:
      "Barrier-repairing ampoule with 80% centella extract and probiotics. Calms sensitivity and strengthens skin.",
    price: 2100,
    category: "serums",
    brand: "SKIN1004",
    images: [IMG.serum],
    concerns: ["Redness", "Sensitive", "Barrier Repair"],
    volume: "50ml",
    stock: 40,
    isBestSeller: true,
  }),
  p({
    id: "skin1004-tone-up-sun-50",
    slug: "tone-brightening-tone-up-sunscreen-spf50-50ml",
    name: "SKIN1004 Tone Brightening Tone-Up Sunscreen SPF50+ PA++++ 50ml",
    description:
      "Brightening tone-up sunscreen that evens skin tone while protecting from UV. Natural, not ghostly.",
    price: 1750,
    category: "sun-care",
    brand: "SKIN1004",
    images: [IMG.sun],
    concerns: ["UV Protection", "Brightening"],
    volume: "50ml",
    stock: 30,
  }),
  p({
    id: "skin1004-capsule-ampoule-50",
    slug: "tone-brightening-capsule-ampoule-50ml",
    name: "SKIN1004 Madagascar Centella Tone Brightening Capsule Ampoule 50ml",
    description:
      "Brightening ampoule with niacinamide that targets dark spots and dullness for an even tone.",
    price: 2150,
    category: "serums",
    brand: "SKIN1004",
    images: [IMG.serum],
    concerns: ["Hyperpigmentation", "Brightening"],
    volume: "50ml",
    stock: 32,
  }),
  p({
    id: "skin1004-capsule-ampoule-30",
    slug: "tone-brightening-capsule-ampoule-30ml",
    name: "SKIN1004 Madagascar Centella Tone Brightening Capsule Ampoule 30ml",
    description:
      "Brightening ampoule with niacinamide for dark spots and dull, uneven skin tone.",
    price: 1500,
    category: "serums",
    brand: "SKIN1004",
    images: [IMG.serum],
    concerns: ["Hyperpigmentation", "Brightening"],
    volume: "30ml",
    stock: 45,
  }),
  p({
    id: "skin1004-light-cleansing-oil-30",
    slug: "light-cleansing-oil-30ml",
    name: "SKIN1004 Madagascar Centella Light Cleansing Oil 30ml",
    description:
      "Travel-size light cleansing oil that melts away makeup and sunscreen without stripping.",
    price: 700,
    category: "cleansers",
    brand: "SKIN1004",
    images: [IMG.oil],
    concerns: ["Pores", "Sensitive"],
    volume: "30ml",
    stock: 50,
  }),
  p({
    id: "skin1004-probio-ampoule-95",
    slug: "probio-cica-intensive-ampoule-95ml",
    name: "SKIN1004 Madagascar Centella Probio-Cica Intensive Ampoule 95ml",
    description:
      "Extra-large barrier-repairing ampoule. Your daily soothing dose of centella and probiotics.",
    price: 3500,
    category: "serums",
    brand: "SKIN1004",
    images: [IMG.serum],
    concerns: ["Redness", "Sensitive", "Barrier Repair"],
    volume: "95ml",
    stock: 20,
  }),
  p({
    id: "skin1004-capsule-ampoule-100",
    slug: "tone-brightening-capsule-ampoule-100ml",
    name: "SKIN1004 Madagascar Centella Tone Brightening Capsule Ampoule 100ml",
    description:
      "Value-size brightening ampoule with niacinamide for radiant, even-toned skin.",
    price: 3600,
    category: "serums",
    brand: "SKIN1004",
    images: [IMG.serum],
    concerns: ["Hyperpigmentation", "Brightening"],
    volume: "100ml",
    stock: 18,
  }),
  p({
    id: "skin1004-light-cleansing-oil-200",
    slug: "light-cleansing-oil-200ml",
    name: "SKIN1004 Madagascar Centella Light Cleansing Oil 200ml",
    description:
      "Full-size light cleansing oil — gentle first step that removes makeup and sunscreen effortlessly.",
    price: 2200,
    category: "cleansers",
    brand: "SKIN1004",
    images: [IMG.oil],
    concerns: ["Pores", "Sensitive"],
    volume: "200ml",
    stock: 28,
  }),
  p({
    id: "skin1004-ampoule-foam-cleanser-125",
    slug: "ampoule-foam-cleanser-125ml",
    name: "SKIN1004 Madagascar Centella Ampoule Foam Cleanser 125ml",
    description:
      "Low-pH foaming cleanser with centella that cleanses gently without stripping the barrier.",
    price: 1400,
    category: "cleansers",
    brand: "SKIN1004",
    images: [IMG.cleanser],
    concerns: ["Sensitive", "Pores"],
    volume: "125ml",
    stock: 40,
  }),

  // ─── ANUA ─────────────────────────────────────────────────
  p({
    id: "anua-invisible-matte-sun",
    slug: "invisible-matte-finish-sunscreen",
    name: "ANUA Invisible Matte Finish Sunscreen",
    description:
      "Oil-controlling, invisible matte sunscreen that keeps you shine-free all day. SPF50+ PA++++.",
    price: 1850,
    category: "sun-care",
    brand: "ANUA",
    images: [IMG.sun],
    concerns: ["UV Protection", "Oil Control"],
    volume: "50ml",
    stock: 35,
  }),
  p({
    id: "anua-niacinamide-txa-serum",
    slug: "niacinamide-10-txa-4-serum",
    name: "ANUA Niacinamide 10% + TXA 4% Serum",
    description:
      "Brightening serum for dark spots and post-acne marks with 10% niacinamide and 4% TXA.",
    price: 2050,
    category: "serums",
    brand: "ANUA",
    images: [IMG.glow],
    concerns: ["Hyperpigmentation", "Brightening", "Acne"],
    volume: "30ml",
    stock: 30,
  }),
  p({
    id: "anua-zero-cast-sun-50",
    slug: "zero-cast-moisturizing-finish-sunscreen-spf50-50ml",
    name: "Anua Zero-Cast Moisturizing Finish Sunscreen SPF50+ PA++++ 50ml",
    description:
      "Moisturizing, zero-white-cast sunscreen that leaves a natural finish. Perfect under makeup.",
    price: 1900,
    category: "sun-care",
    brand: "ANUA",
    images: [IMG.sun],
    concerns: ["UV Protection", "Hydration"],
    volume: "50ml",
    stock: 30,
  }),

  // ─── Beauty of Joseon ─────────────────────────────────────
  p({
    id: "boj-daily-tinted-fluid",
    slug: "daily-tinted-fluid-sunscreen",
    name: "Beauty of Joseon Daily Tinted Fluid Sunscreen (Shades: LP100, LN110, MP200)",
    description:
      "Tinted sunscreen that evens skin tone with a natural glow. Available in three shades.",
    price: 1950,
    category: "sun-care",
    brand: "Beauty of Joseon",
    images: [IMG.sun],
    concerns: ["UV Protection", "Brightening"],
    volume: "30ml",
    stock: 25,
  }),

  // ─── ARENCIA ──────────────────────────────────────────────
  p({
    id: "arencia-vit-c-30",
    slug: "vitamin-c-booster-shot-30ml",
    name: "ARENCIA Vitamin C Booster Shot 30ml",
    description:
      "Brightening vitamin C booster that fades dark spots and boosts radiance.",
    price: 1900,
    category: "serums",
    brand: "ARENCIA",
    images: [IMG.serum],
    concerns: ["Hyperpigmentation", "Brightening"],
    volume: "30ml",
    stock: 25,
  }),
  p({
    id: "arencia-vit-c-10",
    slug: "vitamin-c-booster-shot-10ml",
    name: "ARENCIA Vitamin C Booster Shot 10ml",
    description:
      "Mini vitamin C booster to try before you buy — brightens and evens skin tone.",
    price: 700,
    category: "serums",
    brand: "ARENCIA",
    images: [IMG.serum],
    concerns: ["Hyperpigmentation", "Brightening"],
    volume: "10ml",
    stock: 40,
  }),
  p({
    id: "arencia-rice-mochi-cleanser",
    slug: "fresh-green-rice-mochi-cleanser-120g",
    name: "ARENCIA Fresh Green Rice Mochi Cleanser 120g",
    description:
      "Creamy low-pH cleanser with fresh green rice that leaves skin soft like mochi — never tight.",
    price: 1500,
    category: "cleansers",
    brand: "ARENCIA",
    images: [IMG.cleanser],
    concerns: ["Sensitive", "Dryness"],
    volume: "120g",
    stock: 35,
  }),

  // ─── Celimax ──────────────────────────────────────────────
  p({
    id: "celimax-retinal-booster-15",
    slug: "vita-a-retinal-shot-tightening-booster-15ml",
    name: "Celimax The Vita A Retinal Shot Tightening Booster 15ml",
    description:
      "Gentle retinal booster that firms and smooths while reducing the look of fine lines.",
    price: 2150,
    category: "serums",
    brand: "Celimax",
    images: [IMG.serum],
    concerns: ["Anti-Aging", "Fine Lines"],
    volume: "15ml",
    stock: 22,
  }),
  p({
    id: "celimax-noni-ampoule-30",
    slug: "real-noni-energy-ampoule-30ml",
    name: "Celimax The Real Noni Energy Ampoule 30ml",
    description:
      "Hydrating ampoule with 88% fermented noni extract for a dewy, energized glow.",
    price: 1900,
    category: "serums",
    brand: "Celimax",
    images: [IMG.serum],
    concerns: ["Hydration", "Dullness"],
    volume: "30ml",
    stock: 25,
  }),
  p({
    id: "celimax-noni-ampoule-10",
    slug: "real-noni-energy-ampoule-10ml",
    name: "Celimax The Real Noni Energy Ampoule 10ml",
    description:
      "Mini noni energy ampoule — a hydrating glow boost in a travel-friendly size.",
    price: 750,
    category: "serums",
    brand: "Celimax",
    images: [IMG.serum],
    concerns: ["Hydration", "Dullness"],
    volume: "10ml",
    stock: 40,
  }),

  // ─── Torriden ─────────────────────────────────────────────
  p({
    id: "torriden-ha-serum-50",
    slug: "dive-in-low-molecule-ha-serum-50ml",
    name: "Torriden Dive In Low Molecule Hyaluronic Acid Serum 50ml",
    description:
      "Low-molecular hyaluronic acid serum that plumps and deeply hydrates all skin layers.",
    price: 1600,
    category: "serums",
    brand: "Torriden",
    images: [IMG.serum],
    concerns: ["Hydration", "Dryness"],
    volume: "50ml",
    stock: 40,
    isBestSeller: true,
  }),
  p({
    id: "torriden-soothing-cream-100",
    slug: "dive-in-low-molecular-ha-soothing-cream-100ml",
    name: "Torriden DIVE IN Low Molecular Hyaluronic Acid Soothing Cream 100ml",
    description:
      "Lightweight soothing cream with low-molecular HA for long-lasting, non-sticky hydration.",
    price: 1800,
    category: "moisturizers",
    brand: "Torriden",
    images: [IMG.cream],
    concerns: ["Hydration", "Dryness"],
    volume: "100ml",
    stock: 30,
  }),
  p({
    id: "torriden-mild-sun-cream-60",
    slug: "dive-in-mild-sun-cream-spf50-60ml",
    name: "Torriden Dive In Mild Sun Cream SPF50+ PA++++ 60ml",
    description:
      "Gentle, hydrating sun cream that protects without irritation. No white cast.",
    price: 1750,
    category: "sun-care",
    brand: "Torriden",
    images: [IMG.sun],
    concerns: ["UV Protection", "Sensitive"],
    volume: "60ml",
    stock: 28,
  }),

  // ─── Medicube ─────────────────────────────────────────────
  p({
    id: "medicube-triple-collagen-cream",
    slug: "triple-collagen-cream-50ml",
    name: "Medicube Triple Collagen Cream 50ml",
    description:
      "Triple collagen cream that firms, tightens and plumps for bouncy, youthful skin.",
    price: 2200,
    category: "moisturizers",
    brand: "Medicube",
    images: [IMG.cream],
    concerns: ["Anti-Aging", "Firming"],
    volume: "50ml",
    stock: 25,
  }),
  p({
    id: "medicube-pdrn-peptide-serum",
    slug: "pdrn-pink-peptide-serum-30ml",
    name: "Medicube PDRN Pink Peptide Serum 30ml",
    description:
      "Pink peptide + PDRN serum that visibly plumps and firms tired, aging skin.",
    price: 2300,
    category: "serums",
    brand: "Medicube",
    images: [IMG.serum],
    concerns: ["Anti-Aging", "Firming"],
    volume: "30ml",
    stock: 22,
  }),
  p({
    id: "medicube-collagen-night-mask",
    slug: "collagen-night-wrapping-mask-75ml",
    name: "Medicube Collagen Night Wrapping Mask 75ml",
    description:
      "Overnight collagen mask that wraps skin in moisture and firms while you sleep.",
    price: 2100,
    category: "masks",
    brand: "Medicube",
    images: [IMG.mask],
    concerns: ["Anti-Aging", "Dryness"],
    volume: "75ml",
    stock: 25,
  }),
  p({
    id: "medicube-pdrn-capsule-cream",
    slug: "pdrn-pink-collagen-capsule-cream-55g",
    name: "Medicube PDRN Pink Collagen Capsule Cream 55g",
    description:
      "Capsule cream with pink collagen and PDRN that deeply firms and restores radiance.",
    price: 2400,
    category: "moisturizers",
    brand: "Medicube",
    images: [IMG.cream],
    concerns: ["Anti-Aging", "Firming"],
    volume: "55g",
    stock: 20,
  }),
  p({
    id: "medicube-txa-niacinamide-serum",
    slug: "txa-niacinamide-15-serum-30ml",
    name: "Medicube TXA Niacinamide 15% Serum 30ml",
    description:
      "High-strength brightening serum that fades dark spots and evens skin tone.",
    price: 2150,
    category: "serums",
    brand: "Medicube",
    images: [IMG.serum],
    concerns: ["Hyperpigmentation", "Brightening"],
    volume: "30ml",
    stock: 24,
  }),
  p({
    id: "medicube-txa-capsule-cream",
    slug: "txa-niacinamide-capsule-cream-55g",
    name: "Medicube TXA + Niacinamide Capsule Cream 55g",
    description:
      "Brightening capsule cream that targets dark spots and leaves skin glowing.",
    price: 2300,
    category: "moisturizers",
    brand: "Medicube",
    images: [IMG.cream],
    concerns: ["Hyperpigmentation", "Brightening"],
    volume: "55g",
    stock: 20,
  }),
  p({
    id: "medicube-collagen-jelly-cream",
    slug: "collagen-jelly-cream-50ml",
    name: "Medicube Collagen Jelly Cream 50ml",
    description:
      "Bouncy jelly cream with collagen that refreshes and hydrates with a cooling feel.",
    price: 1900,
    category: "moisturizers",
    brand: "Medicube",
    images: [IMG.cream],
    concerns: ["Hydration", "Firming"],
    volume: "50ml",
    stock: 28,
  }),
  p({
    id: "medicube-kojic-turmeric-vita-cream",
    slug: "kojic-acid-turmeric-vita-capsule-cream-53g",
    name: "Medicube Kojic Acid Turmeric Vita Capsule Cream 53g",
    description:
      "Kojic acid + turmeric brightening cream that targets dark spots and dullness.",
    price: 2300,
    category: "moisturizers",
    brand: "Medicube",
    images: [IMG.cream],
    concerns: ["Hyperpigmentation", "Brightening"],
    volume: "53g",
    stock: 18,
  }),
  p({
    id: "medicube-deep-vita-c-serum",
    slug: "deep-vita-c-capsule-serum-30ml",
    name: "Medicube Deep Vita C Capsule Serum 30ml",
    description:
      "Potent vitamin C capsule serum that brightens and firms for radiant skin.",
    price: 2350,
    category: "serums",
    brand: "Medicube",
    images: [IMG.serum],
    concerns: ["Brightening", "Anti-Aging"],
    volume: "30ml",
    stock: 20,
  }),
  p({
    id: "medicube-pdrn-gel-mask",
    slug: "pdrn-pink-collagen-gel-mask",
    name: "Medicube PDRN Pink Collagen Gel Mask",
    description:
      "Soothe and firm with this PDRN + collagen gel mask — a spa step at home.",
    price: 1600,
    category: "masks",
    brand: "Medicube",
    images: [IMG.mask],
    concerns: ["Anti-Aging", "Sensitive"],
    volume: "1 pack",
    stock: 30,
  }),
  p({
    id: "medicube-deep-vita-c-cream",
    slug: "deep-vita-c-capsule-cream-55g",
    name: "Medicube Deep Vita C Capsule Cream 55g",
    description:
      "Vitamin C capsule cream that brightens and firms, leaving a healthy glow.",
    price: 2400,
    category: "moisturizers",
    brand: "Medicube",
    images: [IMG.cream],
    concerns: ["Brightening", "Anti-Aging"],
    volume: "55g",
    stock: 18,
  }),
  p({
    id: "medicube-kojic-turmeric-gel-mask",
    slug: "kojic-acid-turmeric-brightening-gel-mask-28g",
    name: "Medicube Kojic Acid Turmeric Brightening Gel Mask 28g",
    description:
      "Brightening gel mask with kojic acid and turmeric for a quick at-home glow.",
    price: 850,
    category: "masks",
    brand: "Medicube",
    images: [IMG.mask],
    concerns: ["Brightening", "Dullness"],
    volume: "28g",
    stock: 35,
  }),
  p({
    id: "medicube-kojic-turmeric-niacinamide-serum",
    slug: "kojic-acid-turmeric-niacinamide-serum-30ml",
    name: "Medicube Kojic Acid Turmeric Niacinamide Serum 30ml",
    description:
      "Triple-action brightening serum that fades dark spots and evens skin tone.",
    price: 2200,
    category: "serums",
    brand: "Medicube",
    images: [IMG.serum],
    concerns: ["Hyperpigmentation", "Brightening"],
    volume: "30ml",
    stock: 22,
  }),
];
