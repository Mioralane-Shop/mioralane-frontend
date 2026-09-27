"use client";

import { useEffect, useState } from "react";
import { formatApiError } from "@/lib/api-errors";
// Review images are temporarily disabled — restore the ImagePlus/X icons to re-enable review images.
// import { CheckCircle2, ImagePlus, Loader2, Star, X } from "lucide-react";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSubmitReview } from "@/hooks/use-reviews";
// Review images are temporarily disabled.
// import { reviewService } from "@/services/review.service";
import { cn } from "@/lib/utils";
// Review images are temporarily disabled.
// import type { ReviewImage } from "@/types/review";

// Review images are temporarily disabled.
// const MAX_IMAGES = 3;
// const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
// const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ReviewForm({
    open,
    onOpenChange,
    productId,
    productName,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productId: string;
    productName: string;
}) {
    const submitReview = useSubmitReview();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    // Review images are temporarily disabled.
    // const [files, setFiles] = useState<File[]>([]);
    // const [previews, setPreviews] = useState<string[]>([]);
    // const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    // Review images are temporarily disabled.
    // useEffect(() => {
    //     return () => {
    //         previews.forEach((url) => URL.revokeObjectURL(url));
    //     };
    // }, [previews]);

    useEffect(() => {
        if (!open) {
            setSubmitted(false);
            setError(null);
        }
    }, [open]);

    // Review images are temporarily disabled.
    // const isBusy = isUploading || submitReview.isPending;
    const isBusy = submitReview.isPending;

    function resetForm() {
        setRating(0);
        setHoverRating(0);
        setComment("");
        // Review images are temporarily disabled.
        // setFiles([]);
        // setPreviews([]);
        setError(null);
    }

    // Review images are temporarily disabled — restore this block to re-enable review images.
    // function handleFileSelection(selected: FileList | null) {
    //     if (!selected || selected.length === 0) return;
    //
    //     setError(null);
    //     const next = [...files];
    //
    //     for (const file of Array.from(selected)) {
    //         if (next.length >= MAX_IMAGES) {
    //             setError(`You can attach up to ${MAX_IMAGES} images.`);
    //             break;
    //         }
    //
    //         if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    //             setError("Only JPEG, PNG, or WebP images are allowed.");
    //             continue;
    //         }
    //
    //         if (file.size > MAX_IMAGE_BYTES) {
    //             setError("Each image must be 8MB or smaller.");
    //             continue;
    //         }
    //
    //         next.push(file);
    //     }
    //
    //     setFiles(next);
    //     setPreviews(next.map((file) => URL.createObjectURL(file)));
    // }
    //
    // function removeImage(index: number) {
    //     const next = files.filter((_, position) => position !== index);
    //     setFiles(next);
    //     setPreviews(next.map((file) => URL.createObjectURL(file)));
    // }

    async function handleSubmit() {
        setError(null);

        if (rating < 1) {
            setError("Select a star rating.");
            return;
        }

        if (comment.trim().length < 3) {
            setError("Please write a few words about the product.");
            return;
        }

        try {
            // Review images are temporarily disabled.
            // let images: ReviewImage[] = [];
            //
            // if (files.length > 0) {
            //     setIsUploading(true);
            //     images = await Promise.all(files.map((file) => reviewService.uploadImage(file)));
            //     setIsUploading(false);
            // }

            await submitReview.mutateAsync({
                productId,
                rating,
                comment: comment.trim(),
                // Review images are temporarily disabled.
                // images,
            });

            resetForm();
            setSubmitted(true);
        } catch (requestError) {
            // Review images are temporarily disabled.
            // setIsUploading(false);
            const message = formatApiError(requestError, "Unable to submit your review.");
            setError(message);
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex w-full max-w-[100vw] flex-col p-0 sm:max-w-md">
                <SheetHeader className="border-b border-brand-100 px-5 py-4">
                    <SheetTitle className="text-base font-medium">Write a review</SheetTitle>
                </SheetHeader>

                {submitted ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                        <CheckCircle2 className="h-12 w-12 text-success" />
                        <p className="text-base font-medium text-neutral-700">Thanks for your review</p>
                        <p className="text-sm text-neutral-400">
                            It will appear on {productName} once our team approves it.
                        </p>
                        <Button className="mt-2" onClick={() => onOpenChange(false)}>
                            Done
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
                            <div>
                                <p className="text-sm font-medium text-neutral-700">{productName}</p>
                                <p className="mt-1 text-xs text-neutral-400">
                                    Your review is submitted as a verified purchase after we check your order.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700">Your rating</label>
                                <div className="flex items-center gap-1" role="radiogroup" aria-label="Star rating">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            role="radio"
                                            aria-checked={rating === star}
                                            aria-label={`${star} star${star === 1 ? "" : "s"}`}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="rounded-full p-1 transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={cn(
                                                    "h-7 w-7",
                                                    star <= (hoverRating || rating)
                                                        ? "fill-[#E9B949] text-[#E9B949]"
                                                        : "text-neutral-300",
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700" htmlFor="review-comment">
                                    Your review
                                </label>
                                <textarea
                                    id="review-comment"
                                    value={comment}
                                    onChange={(event) => setComment(event.target.value)}
                                    rows={5}
                                    maxLength={2000}
                                    placeholder="What did you think of this product?"
                                    className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-neutral-700 outline-none transition-colors focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                                />
                                <p className="text-right text-xs text-neutral-400">{comment.length}/2000</p>
                            </div>

                            {/* Review images are temporarily disabled — restore this block to re-enable review images. */}
                            {/*
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-neutral-700">
                                    Photos (optional, up to {MAX_IMAGES})
                                </p>
                                <div className="flex flex-wrap items-center gap-3">
                                    {previews.map((preview, index) => (
                                        <div
                                            key={preview}
                                            className="relative h-20 w-20 overflow-hidden rounded-xl border border-border bg-brand-50"
                                        >
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={preview} alt={`Review image ${index + 1}`} className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                aria-label="Remove image"
                                                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-neutral-600 shadow-sm transition-colors hover:text-red-500"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {files.length < MAX_IMAGES ? (
                                        <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-xs text-neutral-400 transition-colors hover:border-brand-300 hover:text-brand-500">
                                            <ImagePlus className="h-5 w-5" />
                                            Add
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                multiple
                                                className="hidden"
                                                onChange={(event) => {
                                                    handleFileSelection(event.target.files);
                                                    event.target.value = "";
                                                }}
                                            />
                                        </label>
                                    ) : null}
                                </div>
                            </div>
                            */}

                            {error ? (
                                <div className="rounded-2xl border border-brand-200 bg-brand-50/70 px-4 py-3 text-sm text-neutral-700">
                                    {error}
                                </div>
                            ) : null}
                        </div>

                        <div className="shrink-0 border-t border-brand-100 px-5 py-4">
                            <Button className="w-full" size="lg" onClick={handleSubmit} disabled={isBusy}>
                                {isBusy ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {/* Review images are temporarily disabled. */}
                                        {/* {isUploading ? "Uploading images..." : "Submitting..."} */}
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit review"
                                )}
                            </Button>
                            <p className="mt-2 text-center text-xs text-neutral-400">
                                Reviews are published after moderation.
                            </p>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
