export interface Product {
  id: string;
  slug: string;
  name: string;
  /**
   * The name for cards, grids, search results, cart and wishlist rows. Optional:
   * blank means "use `name`", which the API also resolves server-side. Readers go
   * through `lib/product-name.ts` rather than reading the field directly.
   */
  shortName?: string;
  description: string;
  longDescription?: string;
  price: number;
  compareAtPrice?: number;
  krw?: string;
  images: string[];
  media?: ProductMedia[];
  hoverImage?: string;
  category: string;
  brand: string;
  /**
   * Slug of `brand`, supplied by the API and used to build the canonical
   * `/product/<brandSlug>/<slug>` URL. Optional so an older payload (or a bundled
   * catalogue entry) still type-checks — `productPath()` slugifies `brand` then.
   */
  brandSlug?: string;
  tags: string[];
  concerns?: string[];
  skinConcern?: string[];
  tag?: "best" | "new" | null;
  rating: number;
  reviewCount: number;
  stock: number;
  availabilityMode?: "in_stock" | "pre_order";
  preOrder?: {
    expectedArrivalDate?: string;
    quantityLimit?: number;
    customerMessage?: string;
    status?: "accepting" | "closed" | "arrived";
    remainingQuantity?: number;
  };
  ingredients?: string;
  howToUse?: string;
  keyIngredients?: ProductKeyIngredient[];
  skinType?: string[];
  volume?: string;
  volumeOz?: string;
  size?: string;
  sizeOptions?: SizeOption[];
  source?: string;
  sku?: string;
  isNew?: boolean;
  isNewArrival?: boolean;
  isPopularPick?: boolean;
  isBestSeller?: boolean;
  itemType?: "product" | "combo";
  recommendationPriority?: number;
  createdAt: string;
}

export interface ProductKeyIngredient {
  name: string;
}

export interface ProductMedia {
  provider: "imagekit";
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  size?: number;
  mimeType?: string;
  alt?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface SizeOption {
  label: string;
  volume: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

export interface CartItem {
  itemId: string;
  itemType: "product" | "combo";
  product: Product;
  quantity: number;
  catalogStatus?: CartCatalogStatus;
  catalogMessage?: string;
}

export type CartCatalogStatus = "verified" | "missing" | "error";

export interface OrderItem {
  itemType: "product" | "combo";
  sourceId: string;
  productId?: string;
  comboId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  createdAt: string;
  shippingAddress: ShippingAddress;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  skinType?: string;
  sortBy?: "price-asc" | "price-desc" | "newest" | "rating" | "popular" | "popularity";
  search?: string;
}
