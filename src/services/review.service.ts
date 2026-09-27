import api from "@/lib/axios";
import type {
    CustomerReview,
    ProductReviewsResponse,
    ReviewEligibility,
    ReviewImage,
    ReviewSort,
    SubmitReviewPayload,
} from "@/types/review";

export interface ReviewImageUploadResponse {
    success: boolean;
    data: {
        provider: "imagekit";
        assetType: string;
        fileId: string | null;
        url: string | null;
        name: string | null;
        width: number | null;
        height: number | null;
        size: number | null;
        mimeType: string | null;
        fileType: string | null;
        thumbnailUrl: string | null;
    };
}

export const reviewService = {
    getProductReviews: async (
        productId: string,
        options: { sort?: ReviewSort; page?: number; limit?: number } = {},
    ): Promise<ProductReviewsResponse> => {
        const params: Record<string, string> = {};
        if (options.sort) params.sort = options.sort;
        if (options.page) params.page = String(options.page);
        if (options.limit) params.limit = String(options.limit);

        const { data } = await api.get<ProductReviewsResponse>(`/reviews/product/${productId}`, {
            params,
        });
        return data;
    },

    getMine: async (): Promise<CustomerReview[]> => {
        const { data } = await api.get<{ success: boolean; reviews: CustomerReview[] }>("/reviews/me");
        return data.reviews;
    },

    getEligibility: async (productId: string): Promise<ReviewEligibility> => {
        const { data } = await api.get<{ success: boolean; eligibility: ReviewEligibility }>(
            `/reviews/eligibility/${productId}`,
        );
        return data.eligibility;
    },

    submit: async (payload: SubmitReviewPayload): Promise<void> => {
        await api.post("/reviews", payload);
    },

    /**
     * Uploads a review image through the existing ImageKit media pipeline.
     * The backend forces the review asset type and returns the stored asset.
     */
    uploadImage: async (file: File): Promise<ReviewImage> => {
        const formData = new FormData();
        formData.append("file", file);

        const { data } = await api.post<ReviewImageUploadResponse>("/media/review-images", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        const uploaded = data.data;

        return {
            provider: "imagekit",
            fileId: uploaded.fileId,
            url: uploaded.url ?? "",
            name: uploaded.name ?? undefined,
            width: uploaded.width ?? undefined,
            height: uploaded.height ?? undefined,
            size: uploaded.size ?? undefined,
            mimeType: uploaded.mimeType ?? undefined,
        };
    },
};
