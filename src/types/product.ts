export interface Product {
  id: string;
  slug: string;
  name: string;
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
  isBestSeller?: boolean;
  itemType?: "product" | "combo";
  createdAt: string;
}

export interface ProductKeyIngredient {
  name: string;
  benefit?: string;
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
