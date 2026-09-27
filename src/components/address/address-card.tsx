"use client";

import { useState } from "react";
import { Check, Loader2, MapPin, Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SavedAddress } from "@/types/address";

type AddressCardProps = {
    address: SavedAddress;
    /** Providing this switches the card into checkout selection mode. */
    onSelect?: () => void;
    isSelected?: boolean;
    onEdit?: () => void;
    onDelete?: () => void | Promise<void>;
    onSetDefault?: () => void | Promise<void>;
    isDeleting?: boolean;
    isSettingDefault?: boolean;
};

export function AddressCard({
    address,
    onSelect,
    isSelected = false,
    onEdit,
    onDelete,
    onSetDefault,
    isDeleting = false,
    isSettingDefault = false,
}: AddressCardProps) {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const isSelectable = typeof onSelect === "function";
    const isBusy = isDeleting || isSettingDefault;

    const body = (
        <>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="font-medium text-neutral-800">{address.name}</p>
                    <p className="mt-0.5 text-sm text-neutral-500">{address.phone}</p>
                </div>

                {isSelectable ? (
                    <span
                        aria-hidden="true"
                        className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                            isSelected
                                ? "border-brand-500 bg-brand-500 text-white"
                                : "border-neutral-300 bg-white",
                        )}
                    >
                        {isSelected && <Check className="h-3 w-3" />}
                    </span>
                ) : (
                    address.isDefault && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                            <Star className="h-3 w-3 fill-current" />
                            Default
                        </span>
                    )
                )}
            </div>

            <div className="mt-2 flex items-start gap-2 text-sm text-neutral-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
                <div className="min-w-0">
                    <p className="break-words">
                        {address.fullAddress}
                    </p>
                    <p className="mt-0.5 break-words text-xs text-neutral-400">
                        {[address.area, address.district, address.division].filter(Boolean).join(", ")}
                    </p>
                    {address.landmark && (
                        <p className="mt-0.5 break-words text-xs text-neutral-400">
                            Landmark: {address.landmark}
                        </p>
                    )}
                </div>
            </div>

            {isSelectable && address.isDefault && (
                <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600">
                    <Star className="h-3 w-3 fill-current" />
                    Default address
                </p>
            )}

            {!isSelectable && (onEdit || onDelete || onSetDefault) && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-brand-50 pt-3">
                    {onSetDefault && !address.isDefault && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void onSetDefault()}
                            disabled={isBusy}
                        >
                            {isSettingDefault ? (
                                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Star className="mr-1 h-3.5 w-3.5" />
                            )}
                            Set as default
                        </Button>
                    )}

                    {onEdit && (
                        <Button type="button" variant="ghost" size="sm" onClick={onEdit} disabled={isBusy}>
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Edit
                        </Button>
                    )}

                    {onDelete &&
                        (isConfirmingDelete ? (
                            <span className="flex flex-wrap items-center gap-2">
                                <span className="text-xs text-neutral-500">Delete this address?</span>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => void onDelete()}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                    ) : null}
                                    Confirm
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsConfirmingDelete(false)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                            </span>
                        ) : (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => setIsConfirmingDelete(true)}
                                disabled={isBusy}
                            >
                                <Trash2 className="mr-1 h-3.5 w-3.5" />
                                Delete
                            </Button>
                        ))}
                </div>
            )}
        </>
    );

    if (isSelectable) {
        return (
            <button
                type="button"
                onClick={onSelect}
                aria-pressed={isSelected}
                className={cn(
                    "w-full rounded-2xl border p-4 text-left transition-colors",
                    isSelected
                        ? "border-brand-400 bg-brand-50/60 ring-1 ring-brand-300"
                        : "border-brand-100 bg-white hover:border-brand-200 hover:bg-brand-50/30",
                )}
            >
                {body}
            </button>
        );
    }

    return (
        <article
            className={cn(
                "rounded-2xl border bg-white p-4 shadow-sm sm:p-5",
                address.isDefault ? "border-brand-200" : "border-brand-100",
            )}
        >
            {body}
        </article>
    );
}
