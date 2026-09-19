"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "@/services/review.service";
import type { ReviewSort, SubmitReviewPayload } from "@/types/review";

const REVIEWS_PAGE_SIZE = 5;

export function useProductReviews(productId: string, sort: ReviewSort, page: number) {
    return useQuery({
        queryKey: ["product-reviews", productId, sort, page],
        queryFn: () => reviewService.getProductReviews(productId, { sort, page, limit: REVIEWS_PAGE_SIZE }),
        enabled: Boolean(productId),
        retry: false,
    });
}

export function useMyReviews() {
    return useQuery({
        queryKey: ["my-reviews"],
        queryFn: () => reviewService.getMine(),
        retry: false,
    });
}

export function useReviewEligibility(productId: string, enabled: boolean) {
    return useQuery({
        queryKey: ["review-eligibility", productId],
        queryFn: () => reviewService.getEligibility(productId),
        enabled: Boolean(productId) && enabled,
        retry: false,
    });
}

export function useSubmitReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: SubmitReviewPayload) => reviewService.submit(payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
            await queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
            await queryClient.invalidateQueries({ queryKey: ["review-eligibility"] });
            await queryClient.invalidateQueries({ queryKey: ["product"] });
        },
    });
}
