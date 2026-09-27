/**
 * Single source of truth for the site navigation.
 *
 * The desktop rows, the compact desktop bar and the mobile drawer all render
 * this same model, so items, labels, hierarchy and destinations can never drift
 * apart between breakpoints. Only the *layout* changes per screen size.
 */

export type NavLeaf = {
    label: string;
    href?: string;
    comingSoon?: boolean;
};

export type MegaMenuColumn = {
    id: string;
    label: string;
    href?: string;
    comingSoon?: boolean;
    links: NavLeaf[];
};

const MEGA_MENU_COLUMNS: MegaMenuColumn[] = [
    {
        id: "cleansers",
        label: "Cleansers",
        href: "/shop?category=cleansers",
        links: [
            { label: "Oil Cleansers", comingSoon: true },
            { label: "Water Based Cleansers", comingSoon: true },
            { label: "Cleansing Balms", comingSoon: true },
            { label: "Make-Up Removers", comingSoon: true },
            { label: "Micellar Waters", comingSoon: true },
        ],
    },
    {
        id: "toners",
        label: "Toners",
        href: "/shop?category=toners",
        links: [
            { label: "Hydrating Toners", comingSoon: true },
            { label: "Calming Toners", comingSoon: true },
            { label: "Mist Toners", comingSoon: true },
            { label: "Exfoliating Toners", comingSoon: true },
            { label: "Toner Pads", comingSoon: true },
        ],
    },
    {
        id: "treatments",
        label: "Treatments",
        comingSoon: true,
        links: [
            { label: "Serums", comingSoon: true },
            { label: "Ampoules", comingSoon: true },
            { label: "Essences", comingSoon: true },
            { label: "Spot Treatments", comingSoon: true },
        ],
    },
    {
        id: "exfoliators",
        label: "Exfoliators",
        comingSoon: true,
        links: [
            { label: "Physical Exfoliators", comingSoon: true },
            { label: "Chemical Exfoliators", comingSoon: true },
        ],
    },
    {
        id: "concerns",
        label: "Skin Concerns",
        href: "/shop",
        links: [
            { label: "Acne", href: "/shop?concern=acne" },
            { label: "Anti-Aging", href: "/shop?concern=anti-aging" },
            { label: "Dry Skin", comingSoon: true },
            { label: "Fungal Acne Safe", comingSoon: true },
            { label: "Hyperpigmentation", comingSoon: true },
            { label: "Skin Redness", comingSoon: true },
            { label: "Sensitive Skin", href: "/shop?concern=sensitive" },
            { label: "Oily Skin", comingSoon: true },
        ],
    },
    {
        id: "moisturizers",
        label: "Moisturizers",
        href: "/shop?category=moisturizers",
        links: [
            { label: "Face Creams", comingSoon: true },
            { label: "Gel Moisturizers", comingSoon: true },
            { label: "Facial Oils", comingSoon: true },
            { label: "Emulsions", comingSoon: true },
        ],
    },
    {
        id: "masks",
        label: "Masks",
        href: "/shop?category=masks",
        links: [
            { label: "Peeling Masks", comingSoon: true },
            { label: "Sheet Masks", comingSoon: true },
            { label: "Sleeping Masks", comingSoon: true },
            { label: "Wash-Off Masks", comingSoon: true },
        ],
    },
    {
        id: "lip-eye",
        label: "Lip & Eye Care",
        comingSoon: true,
        links: [
            { label: "Eye Creams", comingSoon: true },
            { label: "Eye Patches", comingSoon: true },
            { label: "Lip Care", comingSoon: true },
        ],
    },
    {
        id: "sunscreens",
        label: "Sunscreens",
        href: "/shop?category=sun-care",
        links: [
            { label: "SPF 50+", comingSoon: true },
            { label: "SPF 30", comingSoon: true },
            { label: "Sun Sticks", comingSoon: true },
            { label: "After Sun Care", comingSoon: true },
        ],
    },
    {
        id: "ingredients",
        label: "Shop By Ingredients",
        comingSoon: true,
        links: [
            { label: "AHA BHA PHA", comingSoon: true },
            { label: "Centella", comingSoon: true },
            { label: "Hyaluronic Acid", comingSoon: true },
            { label: "Peptides", comingSoon: true },
            { label: "Propolis", comingSoon: true },
            { label: "Snail Mucin", comingSoon: true },
            { label: "Vitamin C", comingSoon: true },
        ],
    },
];

export type PrimaryNavEntry =
    /** Row with a mega panel (columns of links). */
    | { id: string; kind: "mega"; label: string; href: string; columns: MegaMenuColumn[] }
    /** Row with a panel listing every brand. */
    | { id: string; kind: "brands"; label: string; href: string }
    /** Row with a panel listing the curated combos. */
    | { id: string; kind: "combo"; label: string; href: string }
    /** Plain link. */
    | { id: string; kind: "link"; label: string; href: string }
    /** Not live yet — rendered muted, tapping explains it is coming soon. */
    | { id: string; kind: "soon"; label: string };

/** Top-level menu, in desktop order. Desktop is the source of truth. */
export const PRIMARY_NAV: PrimaryNavEntry[] = [
    {
        id: "skin-care",
        kind: "mega",
        label: "Skin Care",
        href: "/shop",
        columns: MEGA_MENU_COLUMNS,
    },
    { id: "brands", kind: "brands", label: "Brands", href: "/shop" },
    { id: "blog", kind: "link", label: "Blog", href: "/blog" },
    { id: "sales", kind: "soon", label: "Sales" },
];
