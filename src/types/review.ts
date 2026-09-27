export type ReviewStatus = "pending" | "approved" | "rejected";

export type ReviewSort = "newest" | "highest" | "lowest" | "verified";

export type ReviewImage = {
    provider?: string;
    fileId?: string | null;
    url: string;
    name?: string;
    alt?: string;
    width?: number;
    height?: number;
    size?: number;
    mimeType?: string;
    sortOrder?: number;
};

export type ProductReview = {
    id: string;
    rating: number;
    comment: string;
    images: ReviewImage[];
    verifiedPurchase: boolean;
    authorName: string;
    createdAt: string;
};

export type RatingDistribution = {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
};

export type ReviewSummary = {
    averageRating: number;
    reviewCount: number;
    ratingDistribution: RatingDistribution;
};

export type ProductReviewsResponse = {
    success: boolean;
    summary: ReviewSummary;
    reviews: ProductReview[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

export type CustomerReview = {
    id: string;
    productId: string | null;
    rating: number;
    comment: string;
    images: ReviewImage[];
    status: ReviewStatus;
    verifiedPurchase: boolean;
    createdAt: string;
    moderatedAt?: string | null;
    product: {
        id: string;
        title: string;
        slug: string;
        image: string;
    } | null;
};

export type CustomerReviewsResponse = {
    success: boolean;
    reviews: CustomerReview[];
};

export type ReviewEligibility = {
    productId: string;
    eligible: boolean;
    purchased: boolean;
    hasReviewed: boolean;
    orderId: string | null;
    review: {
        id: string;
        status: ReviewStatus;
        rating: number;
        comment: string;
        verifiedPurchase: boolean;
        createdAt: string;
    } | null;
};

export type ReviewEligibilityResponse = {
    success: boolean;
    eligibility: ReviewEligibility;
};

export type SubmitReviewPayload = {
    productId: string;
    rating: number;
    comment: string;
    images?: ReviewImage[];
};
