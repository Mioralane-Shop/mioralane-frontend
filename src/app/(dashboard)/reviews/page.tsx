"use client";

import Link from "next/link";
import { AlertCircle, BadgeCheck, Loader2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RequireAuth } from "@/components/common/require-auth";
import { ProductImage } from "@/components/common/product-image";
import { useMyReviews } from "@/hooks/use-reviews";
import { cn } from "@/lib/utils";
import type { CustomerReview, ReviewStatus } from "@/types/review";

const STATUS_STYLES: Record<ReviewStatus, string> = {
    pending: "border-[#F2D7A6] bg-[#FFF7E6] text-[#B7791F]",
    approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rejected: "border-red-200 bg-red-50 text-red-600",
};

function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
    return (
        <Badge
            variant="outline"
            className={cn("text-[11px] font-semibold uppercase", STATUS_STYLES[status])}
        >
            {status}
        </Badge>
    );
}

export default function MyReviewsPage() {
    return (
        <RequireAuth>
            <MyReviewsContent />
        </RequireAuth>
    );
}

function MyReviewsContent() {
    const { data: reviews, isLoading, isError, error, refetch, isFetching } = useMyReviews();
    const reviewList = reviews ?? [];

    return (
        <div className="container mx-auto max-w-5xl px-4 py-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-light tracking-tight text-neutral-800 sm:text-3xl">My Reviews</h1>
                    <p className="mt-1 text-sm text-neutral-400">
                        Track the reviews you have submitted and their moderation status.
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/orders">My Orders</Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="flex min-h-[40vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white px-6 py-20 text-center">
                    <AlertCircle className="h-16 w-16 text-brand-300" />
                    <h2 className="mt-4 text-xl font-medium text-neutral-700">Could not load your reviews</h2>
                    <p className="mt-2 text-neutral-400">
                        {error?.message || "There was a problem fetching your reviews. Please try again."}
                    </p>
                    <Button className="mt-6" onClick={() => void refetch()} disabled={isFetching}>
                        {isFetching ? "Retrying..." : "Retry"}
                    </Button>
                </div>
            ) : reviewList.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white px-6 py-20 text-center">
                    <Star className="h-16 w-16 text-neutral-300" />
                    <h2 className="mt-4 text-xl font-medium text-neutral-600">No reviews yet</h2>
                    <p className="mt-2 max-w-md text-neutral-400">
                        Once you receive an order, you can review your purchased products and they will appear here.
                    </p>
                    <Link href="/orders" className="mt-6">
                        <Button>Go to My Orders</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviewList.map((review: CustomerReview) => (
                        <Card key={review.id} className="border-brand-100">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-brand-50">
                                            <ProductImage
                                                src={review.product?.image ?? ""}
                                                alt={review.product?.title ?? "Product"}
                                                fallbackId={review.productId ?? review.id}
                                                fill
                                                sizes="56px"
                                                className="object-cover"
                                                deliveryPreset="thumbnail"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            {review.product ? (
                                                <Link
                                                    href={`/product/${review.product.slug}`}
                                                    className="line-clamp-2 text-sm font-medium text-neutral-800 transition-colors hover:text-brand-500"
                                                >
                                                    {review.product.title}
                                                </Link>
                                            ) : (
                                                <p className="text-sm font-medium text-neutral-500">Product no longer available</p>
                                            )}
                                            <p className="mt-1 text-xs text-neutral-400">
                                                Submitted {formatDate(review.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={cn(
                                                        "h-4 w-4",
                                                        star <= review.rating ? "fill-[#E9B949] text-[#E9B949]" : "text-neutral-300",
                                                    )}
                                                />
                                            ))}
                                        </span>
                                        {review.verifiedPurchase ? (
                                            <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-[11px] font-semibold uppercase text-emerald-700">
                                                <BadgeCheck className="h-3 w-3" />
                                                Verified
                                            </Badge>
                                        ) : null}
                                        <ReviewStatusBadge status={review.status} />
                                    </div>
                                </div>

                                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-neutral-600">
                                    {review.comment}
                                </p>

                                {/* Review images are temporarily disabled — restore this block to re-enable review images. */}
                                {/*
                                {review.images.length > 0 ? (
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        {review.images.map((image, index) => (
                                            <span
                                                key={`${image.url}-${index}`}
                                                className="relative h-20 w-20 overflow-hidden rounded-xl border border-border bg-brand-50"
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

                                {review.status === "rejected" ? (
                                    <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-xs text-red-600">
                                        This review was not approved and is not visible on the product page.
                                    </p>
                                ) : review.status === "pending" ? (
                                    <p className="mt-4 rounded-2xl bg-[#FFF7E6] px-4 py-3 text-xs text-[#B7791F]">
                                        Waiting for moderation. It will appear on the product page once approved.
                                    </p>
                                ) : null}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
