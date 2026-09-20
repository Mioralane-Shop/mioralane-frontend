"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Home, Loader2, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RequireAuth } from "@/components/common/require-auth";
import { AddressCard } from "@/components/address/address-card";
import { AddressForm } from "@/components/address/address-form";
import {
    useCreateAddress,
    useDeleteAddress,
    useMyAddresses,
    useSetDefaultAddress,
    useUpdateAddress,
} from "@/hooks/use-addresses";
import { useAuthStore } from "@/store/auth.store";
import { useToastStore } from "@/store/toast.store";
import type { AddressFormValues } from "@/lib/validators/address";
import type { SavedAddress } from "@/types/address";

export default function AddressesPage() {
    return (
        <RequireAuth>
            <AddressesContent />
        </RequireAuth>
    );
}

const getErrorMessage = (error: unknown, fallback: string): string =>
    axios.isAxiosError(error)
        ? ((error.response?.data?.message as string | undefined) ?? fallback)
        : error instanceof Error
            ? error.message
            : fallback;

function AddressesContent() {
    const { user } = useAuthStore();
    const addToast = useToastStore((state) => state.addToast);
    const { data: addresses = [], isLoading, isError } = useMyAddresses();

    const createAddress = useCreateAddress();
    const updateAddress = useUpdateAddress();
    const deleteAddress = useDeleteAddress();
    const setDefaultAddress = useSetDefaultAddress();

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const addPanelRef = useRef<HTMLDivElement | null>(null);
    const editPanelRef = useRef<HTMLDivElement | null>(null);

    // The add panel sits above the list, so make sure it is actually on screen
    // after the user taps "Add Address" / "Edit" from a scrolled position.
    useEffect(() => {
        if (!isAdding && !editingId) return;

        const frame = window.requestAnimationFrame(() => {
            const panel = isAdding ? addPanelRef.current : editPanelRef.current;
            panel?.scrollIntoView({ behavior: "smooth", block: "start" });
        });

        return () => window.cancelAnimationFrame(frame);
    }, [editingId, isAdding]);

    const toFormValues = (address: SavedAddress): AddressFormValues => ({
        name: address.name,
        phone: address.phone,
        division: address.division,
        district: address.district,
        area: address.area,
        fullAddress: address.fullAddress,
        landmark: address.landmark ?? "",
        isDefault: address.isDefault,
    });

    const handleCreate = async (values: AddressFormValues) => {
        try {
            const created = await createAddress.mutateAsync({
                name: values.name,
                phone: values.phone,
                division: values.division,
                district: values.district,
                area: values.area,
                fullAddress: values.fullAddress,
                landmark: values.landmark || undefined,
                isDefault: values.isDefault,
            });
            setIsAdding(false);
            addToast(
                created.isDefault ? "Address saved as your default" : "Address saved",
                "success",
            );
        } catch (error) {
            addToast(getErrorMessage(error, "Unable to save this address"), "error");
        }
    };

    const handleUpdate = async (addressId: string, values: AddressFormValues) => {
        try {
            await updateAddress.mutateAsync({
                id: addressId,
                payload: {
                    name: values.name,
                    phone: values.phone,
                    division: values.division,
                    district: values.district,
                    area: values.area,
                    fullAddress: values.fullAddress,
                    landmark: values.landmark || undefined,
                    isDefault: values.isDefault,
                },
            });
            setEditingId(null);
            addToast("Address updated", "success");
        } catch (error) {
            addToast(getErrorMessage(error, "Unable to update this address"), "error");
        }
    };

    const handleDelete = async (addressId: string) => {
        setDeletingId(addressId);
        try {
            const result = await deleteAddress.mutateAsync(addressId);
            addToast(
                result.promotedDefaultAddressId
                    ? "Address removed — another address is now your default"
                    : "Address removed",
                "success",
            );
        } catch (error) {
            addToast(getErrorMessage(error, "Unable to remove this address"), "error");
        } finally {
            setDeletingId(null);
        }
    };

    const handleSetDefault = async (addressId: string) => {
        setBusyId(addressId);
        try {
            await setDefaultAddress.mutateAsync(addressId);
            addToast("Default address updated", "success");
        } catch (error) {
            addToast(getErrorMessage(error, "Unable to set the default address"), "error");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="container mx-auto max-w-5xl px-4 py-8">
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-light tracking-tight text-neutral-800 sm:text-3xl">
                        Saved Addresses
                    </h1>
                    <p className="mt-1 text-sm text-neutral-400">
                        Manage your delivery addresses and pick one quickly at checkout.
                    </p>
                </div>

                {!isAdding && (
                    <Button
                        type="button"
                        onClick={() => {
                            setEditingId(null);
                            setIsAdding(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Address
                    </Button>
                )}
            </div>

            {isAdding && (
                <Card ref={addPanelRef} className="mb-6 scroll-mt-28 border-brand-100">
                    <CardContent className="p-4 sm:p-6">
                        <h2 className="mb-4 text-lg font-medium text-neutral-800">
                            New Address
                        </h2>
                        <AddressForm
                            key="new-address"
                            defaultValues={{ name: user?.username ?? "" }}
                            submitLabel="Save Address"
                            isSubmitting={createAddress.isPending}
                            showDefaultToggle={addresses.length > 0}
                            onCancel={() => setIsAdding(false)}
                            onSubmit={handleCreate}
                        />
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-16 text-neutral-400">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading your addresses...
                </div>
            ) : isError ? (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    Unable to load your saved addresses. Please refresh the page.
                </p>
            ) : addresses.length === 0 ? (
                !isAdding && (
                    <Card className="border-brand-100">
                        <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
                                <Home className="h-6 w-6 text-brand-500" />
                            </span>
                            <p className="text-lg font-medium text-neutral-800">
                                No saved addresses yet
                            </p>
                            <p className="max-w-sm text-sm text-neutral-400">
                                Save a delivery address once and reuse it at checkout — no need to
                                type it again.
                            </p>
                            <Button type="button" className="mt-2" onClick={() => setIsAdding(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add your first address
                            </Button>
                        </CardContent>
                    </Card>
                )
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((address) =>
                        editingId === address.id ? (
                            <Card
                                key={address.id}
                                ref={editPanelRef}
                                className="scroll-mt-28 border-brand-200 sm:col-span-2"
                            >
                                <CardContent className="p-4 sm:p-6">
                                    <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-neutral-800">
                                        <MapPin className="h-5 w-5 text-brand-500" />
                                        Edit Address
                                    </h2>
                                    <AddressForm
                                        key={address.id}
                                        defaultValues={toFormValues(address)}
                                        submitLabel="Update Address"
                                        isSubmitting={updateAddress.isPending}
                                        showDefaultToggle={!address.isDefault}
                                        onCancel={() => setEditingId(null)}
                                        onSubmit={(values) => handleUpdate(address.id, values)}
                                    />
                                </CardContent>
                            </Card>
                        ) : (
                            <AddressCard
                                key={address.id}
                                address={address}
                                isDeleting={deletingId === address.id}
                                isSettingDefault={busyId === address.id}
                                onEdit={() => {
                                    setIsAdding(false);
                                    setEditingId(address.id);
                                }}
                                onDelete={() => handleDelete(address.id)}
                                onSetDefault={() => handleSetDefault(address.id)}
                            />
                        ),
                    )}
                </div>
            )}
        </div>
    );
}
