export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  sections: { heading: string; body: string }[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "korean-skincare-routine-humid-climate",
    title: "The Perfect 5-Step Korean Skincare Routine for Humid Climates",
    excerpt:
      "Lightweight layers that hydrate without that sticky feeling — a routine built for Bangladesh's weather.",
    image: "/images/blog-routine.jpg",
    category: "Routine",
    date: "March 12, 2026",
    readTime: "6 min read",
    sections: [
      {
        heading: "Start with a water-based cleanser",
        body: "In humid weather your skin produces more oil, so skip heavy creams. A gentle water-based cleanser in the morning and a double cleanse at night keeps pores clear without stripping your barrier.",
      },
      {
        heading: "Hydrate in thin layers",
        body: "Layer a hydrating toner and an essence or light serum before any moisturizer. Thin layers absorb quickly and never feel sticky — even in 90% humidity.",
      },
      {
        heading: "Never skip sunscreen",
        body: "UV is just as strong on cloudy days. Finish your routine with a lightweight, non-greasy SPF50+ like the Beauty of Joseon Relief Sun.",
      },
    ],
  },
  {
    slug: "double-cleansing-101",
    title: "Double Cleansing 101: Why Your Skin Needs It",
    excerpt:
      "Oil cleanser then water cleanser — here's why the two-step method changes everything.",
    image: "/images/blog-double-cleanse.jpg",
    category: "Education",
    date: "February 28, 2026",
    readTime: "5 min read",
    sections: [
      {
        heading: "Step one: the oil cleanser",
        body: "An oil-based cleanser melts away sunscreen, makeup and the day's grime. It dissolves oil-based debris that water can't touch. Massage it onto dry skin, then emulsify with water.",
      },
      {
        heading: "Step two: the water cleanser",
        body: "Follow with a gentle water-based cleanser to sweep away the residue and any water-soluble dirt. Your skin is now genuinely clean, never tight or stripped.",
      },
      {
        heading: "Why it matters in Dhaka",
        body: "City pollution and humidity mean your pores work overtime. Double cleansing in the evening is the single most effective habit for clear, calm skin.",
      },
    ],
  },
  {
    slug: "cosrx-vs-ordinary-snail-essence",
    title: "COSRX vs. The Ordinary: Which Snail Essence Wins?",
    excerpt:
      "We compared the two cult-favorite snail essences on texture, price and results.",
    image: "/images/blog-compare.jpg",
    category: "Comparison",
    date: "February 10, 2026",
    readTime: "4 min read",
    sections: [
      {
        heading: "COSRX Advanced Snail 96",
        body: "A lightweight essence with 96% snail secretion filtrate. It's hydrating, soothing and layers beautifully under moisturizer — our customers' most repurchased product.",
      },
      {
        heading: "The verdict",
        body: "Both are excellent, but for humid climates the COSRX essence wins on texture and absorption. It repairs and hydrates without ever feeling heavy.",
      },
    ],
  },
  {
    slug: "storing-korean-skincare-heat",
    title: "How to Store Korean Skincare in Bangladesh's Heat",
    excerpt:
      "Keep your actives stable and your products fresh with these simple storage rules.",
    image: "/images/blog-storage.jpg",
    category: "Tips",
    date: "January 22, 2026",
    readTime: "4 min read",
    sections: [
      {
        heading: "Keep it cool and dry",
        body: "Heat and sunlight degrade active ingredients. Store products away from windows and direct sunlight — a cool, dry drawer or cupboard is ideal.",
      },
      {
        heading: "Mind the fridge",
        body: "Vitamin C and some essences last longer in the fridge. If you do refrigerate, keep products in an airtight container and use them within a few months.",
      },
      {
        heading: "Close properly",
        body: "Always seal lids tightly after use. Exposure to air and humidity can change the texture and shorten a product's shelf life.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
