"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, BadgeCheck, Loader2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/reviews/review-form";
import { useProductReviews, useReviewEligibility } from "@/hooks/use-reviews";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import type { ProductReview, ReviewSort } from "@/types/review";

const SORT_OPTIONS: Array<{ value: ReviewSort; label: string }> = [
    { value: "newest", label: "Newest" },
    { value: "highest", label: "Highest rating" },
    { value: "lowest", label: "Lowest rating" },
    { value: "verified", label: "Verified purchase" },
];

const DISTRIBUTION_STARS: Array<"5" | "4" | "3" | "2" | "1"> = ["5", "4", "3", "2", "1"];

function formatReviewDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function StarRow({ rating, className }: { rating: number; className?: string }) {
    const rounded = Math.round(rating);

    return (
        <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        "h-3.5 w-3.5",
                        star <= rounded ? "fill-[#E9B949] text-[#E9B949]" : "text-[#D8D2CD]",
                    )}
                />
            ))}
        </span>
    );
}

function ReviewCard({ review }: { review: ProductReview }) {
    return (
        <article className="border-t border-ink/10 py-5 first:border-t-0 first:pt-0">
            <div className="flex flex-wrap items-center gap-3">
                <StarRow rating={review.rating} />
                <span className="text-sm font-medium text-ink">{review.authorName}</span>
                {review.verifiedPurchase ? (
                    <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-[11px] font-semibold uppercase text-emerald-700">
                        <BadgeCheck className="h-3 w-3" />
                        Verified purchase
                    </Badge>
                ) : null}
                <span className="text-xs text-ink-muted">{formatReviewDate(review.createdAt)}</span>
            </div>

            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink/70">{review.comment}</p>

            {/* Review images are temporarily disabled — restore this block to re-enable review images. */}
            {/*
            {review.images.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-3">
                    {review.images.map((image, index) => (
                        <span
                            key={`${image.url}-${index}`}
                            className="relative h-20 w-20 overflow-hidden rounded-xl border border-ink/10 bg-[#FAF9F7]"
                        >
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={image.url}
                                alt={image.alt || `Review image ${index + 1}`}
                                className="h-full w-full object-cover"
                                loading="lazy"
                            />
                        </span>
                    ))}
                </div>
            ) : null}
            */}
        </article>
    );
}

export function ProductReviews({
    productId,
    productName,
}: {
    productId: string;
    productName: string;
}) {
    const [sort, setSort] = useState<ReviewSort>("newest");
    const [page, setPage] = useState(1);
    const [formOpen, setFormOpen] = useState(false);
    const { isAuthenticated, _ready } = useAuthStore();

    const { data, isLoading, isError, error, refetch, isFetching } = useProductReviews(
        productId,
        sort,
        page,
    );
    const { data: eligibility } = useReviewEligibility(productId, _ready && isAuthenticated);

    const summary = data?.summary;
    const reviews = useMemo(() => data?.reviews ?? [], [data?.reviews]);
    const totalPages = Math.max(data?.pagination.totalPages ?? 1, 1);
    const reviewCount = summary?.reviewCount ?? 0;

    const reviewCta = useMemo(() => {
        if (!_ready) return null;

        if (!isAuthenticated) {
            return (
                <Button variant="outline" size="sm" asChild>
                    <Link href="/login">Sign in to review</Link>
                </Button>
            );
        }

        if (eligibility?.hasReviewed) {
            return (
                <span className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium capitalize text-ink-muted">
                    Your review is {eligibility.review?.status ?? "pending"}
                </span>
            );
        }

        if (eligibility?.eligible) {
            return (
                <Button size="sm" onClick={() => setFormOpen(true)}>
                    Write a review
                </Button>
            );
        }

        return (
            <span className="text-xs text-ink-muted">
                Only customers who purchased this product can review it.
            </span>
        );
    }, [_ready, eligibility, isAuthenticated]);

    if (isLoading) {
        return (
            <div className="rounded-3xl border border-ink/10 bg-[#FAF9F7] p-6">
                <div className="flex items-center gap-2 text-sm text-ink-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading reviews...
                </div>
                <div className="mt-5 space-y-3">
                    <div className="h-4 w-40 animate-pulse rounded bg-ink/[0.06]" />
                    <div className="h-4 w-full animate-pulse rounded bg-ink/[0.06]" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-ink/[0.06]" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-3xl border border-ink/10 bg-[#FAF9F7] p-6">
                <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-brand-400" />
                    <div>
                        <p className="text-sm font-semibold text-ink">Unable to load reviews</p>
                        <p className="mt-1 text-sm text-ink-muted">
                            {error?.message || "Please try again in a moment."}
                        </p>
                        <Button variant="outline" size="sm" className="mt-4" onClick={() => void refetch()} disabled={isFetching}>
                            {isFetching ? "Retrying..." : "Retry"}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-3xl border border-ink/10 bg-[#FAF9F7] p-6">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6E6966]">
                        Customer Reviews
                    </p>
                    <div className="mt-4 flex items-end gap-3">
                        <span className="text-4xl font-semibold leading-none text-ink">
                            {(summary?.averageRating ?? 0).toFixed(1)}
                        </span>
                        <div className="pb-1">
                            <StarRow rating={summary?.averageRating ?? 0} className="[&_svg]:h-4 [&_svg]:w-4" />
                            <p className="mt-1 text-xs text-ink-muted">
                                {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-2">
                        {DISTRIBUTION_STARS.map((stars) => {
                            const count = summary?.ratingDistribution?.[stars] ?? 0;
                            const percent = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;

                            return (
                                <div key={stars} className="flex items-center gap-3">
                                    <span className="w-10 text-xs text-ink-muted">{stars} star</span>
                                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/[0.07]">
                                        <span className="block h-full rounded-full bg-[#E9B949]" style={{ width: `${percent}%` }} />
                                    </span>
                                    <span className="w-6 text-right text-xs text-ink-muted">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium uppercase tracking-[0.14em] text-[#6E6966]" htmlFor="review-sort">
                                Sort by
                            </label>
                            <select
                                id="review-sort"
                                value={sort}
                                onChange={(event) => {
                                    setSort(event.target.value as ReviewSort);
                                    setPage(1);
                                }}
                                className="h-9 rounded-full border border-ink/15 bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {reviewCta}
                    </div>

                    {reviews.length === 0 ? (
                        <div className="mt-6 rounded-2xl border border-dashed border-ink/15 bg-white px-5 py-10 text-center">
                            <Star className="mx-auto h-8 w-8 text-ink/15" />
                            <p className="mt-3 text-sm font-semibold text-ink">No reviews yet</p>
                            <p className="mt-1 text-sm text-ink-muted">
                                Be the first to share your experience once you have received your order.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mt-4">
                                {reviews.map((review) => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                            </div>

                            {totalPages > 1 ? (
                                <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((current) => Math.max(current - 1, 1))}
                                        disabled={page <= 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-xs text-ink-muted">
                                        Page {page} of {totalPages}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                                        disabled={page >= totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            </div>

            <ReviewForm
                open={formOpen}
                onOpenChange={setFormOpen}
                productId={productId}
                productName={productName}
            />
        </div>
    );
}
