import Image from "next/image";
import Link from "next/link";

const BLOG_POSTS = [
  {
    title: "The 4-Step Korean Skincare Routine That Actually Works",
    excerpt:
      "Forget the 10-step routines. Here's the simplified version that gives you glass skin without breaking the bank or your schedule.",
    img: "/images/blog-routine.jpg",
    date: "Dec 15, 2024",
    readTime: "5 min read",
  },
  {
    title: "How to Spot Fake Korean Skincare in Bangladesh",
    excerpt:
      "Red flags to watch for, batch code verification methods, and why buying from authorized retailers matters more than you think.",
    img: "/images/blog-double-cleanse.jpg",
    date: "Dec 8, 2024",
    readTime: "7 min read",
  },
  {
    title: "COSRX vs Purito: Which Brand Is Right for Your Skin?",
    excerpt:
      "We compare two of the most popular K-beauty brands across ingredients, price, and results for Bangladesh's climate.",
    img: "/images/blog-compare.jpg",
    date: "Nov 30, 2024",
    readTime: "6 min read",
  },
];

export function BlogPreviewSection() {
  return (
    <section className="bg-surface py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <span className="text-sm font-semibold tracking-wider text-brand">
            Learn
          </span>
          <h2 className="mt-2 text-3xl font-light tracking-tight text-ink">
            Korean skincare guide
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <Link key={post.title} href="#" className="group">
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow group-hover:shadow-md">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={post.img}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <div className="mb-2 flex items-center gap-2 text-xs text-ink/40">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-base font-semibold leading-snug text-ink transition-colors group-hover:text-brand">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/50">
                    {post.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
