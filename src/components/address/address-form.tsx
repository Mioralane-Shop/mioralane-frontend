"use client";

import { useMemo, type KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    getDistrictsByDivision,
    getDivisions,
    getUpazilasByDistrict,
    withSavedOption,
} from "@/constants/bangladesh-locations";
import {
    EMPTY_ADDRESS_FORM,
    addressSchema,
    type AddressFormValues,
} from "@/lib/validators/address";

type AddressFormProps = {
    /** Initial values. Remount the form (with a `key`) to load different values. */
    defaultValues?: Partial<AddressFormValues>;
    submitLabel?: string;
    isSubmitting?: boolean;
    /** Hidden when the edited address is already the default one. */
    showDefaultToggle?: boolean;
    onCancel?: () => void;
    onSubmit: (values: AddressFormValues) => void | Promise<void>;
};

export function AddressForm({
    defaultValues,
    submitLabel = "Save Address",
    isSubmitting = false,
    showDefaultToggle = true,
    onCancel,
    onSubmit,
}: AddressFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: { ...EMPTY_ADDRESS_FORM, ...defaultValues },
    });

    const selectedDivision = watch("division");
    const selectedDistrict = watch("district");
    const selectedArea = watch("area");
    const isDefaultChecked = watch("isDefault") ?? false;
    const submitForm = handleSubmit(onSubmit);

    const divisionOptions = useMemo(() => withSavedOption(getDivisions(), selectedDivision), [selectedDivision]);
    const districtOptions = useMemo(
        () => withSavedOption(getDistrictsByDivision(selectedDivision), selectedDistrict),
        [selectedDivision, selectedDistrict],
    );
    const areaOptions = useMemo(
        () => withSavedOption(getUpazilasByDistrict(selectedDistrict, selectedDivision), selectedArea),
        [selectedArea, selectedDivision, selectedDistrict],
    );

    /**
     * Radix `Select` echoes its own value through `onValueChange` when the value
     * changes programmatically, and emits `''` when it is reset. Treating those
     * echoes as user input would wipe the dependent district/area fields as soon
     * as a prefilled address is loaded.
     */
    const isEchoedSelectValue = (value: string | undefined, current: string | undefined) =>
        !value || value === current;

    const handleDivisionChange = (value: string) => {
        if (isEchoedSelectValue(value, selectedDivision)) return;

        setValue("division", value, { shouldDirty: true, shouldValidate: true });
        setValue("district", "", { shouldDirty: true, shouldValidate: true });
        setValue("area", "", { shouldDirty: true, shouldValidate: true });
    };

    const handleDistrictChange = (value: string) => {
        if (isEchoedSelectValue(value, selectedDistrict)) return;

        setValue("district", value, { shouldDirty: true, shouldValidate: true });
        setValue("area", "", { shouldDirty: true, shouldValidate: true });
    };

    const handleAreaChange = (value: string) => {
        if (isEchoedSelectValue(value, selectedArea)) return;

        setValue("area", value, { shouldDirty: true, shouldValidate: true });
    };

    /**
     * This component can be rendered inside the checkout form, so it deliberately
     * does not render its own <form> (nested forms are invalid HTML and browsers
     * submit them natively). Enter still saves the address, and never bubbles up
     * to submit the order.
     */
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== "Enter") return;

        const target = event.target as HTMLElement | null;
        if (target?.getAttribute("role") === "combobox" || target?.tagName === "TEXTAREA") return;

        event.preventDefault();
        event.stopPropagation();
        void submitForm();
    };

    return (
        <div className="space-y-4" onKeyDown={handleKeyDown}>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <Label htmlFor="address-name">Recipient Name</Label>
                    <Input
                        id="address-name"
                        {...register("name")}
                        placeholder="Jane Doe"
                        className="mt-1"
                    />
                    {errors.name && (
                        <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="address-phone">Phone Number</Label>
                    <Input
                        id="address-phone"
                        {...register("phone")}
                        placeholder="01XXXXXXXXX"
                        className="mt-1"
                    />
                    {errors.phone && (
                        <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                    )}
                </div>

                <div>
                    <Label>Division</Label>
                    <Select value={selectedDivision} onValueChange={handleDivisionChange}>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select division" />
                        </SelectTrigger>
                        <SelectContent>
                            {divisionOptions.map((division) => (
                                <SelectItem key={division.id} value={division.name}>
                                    {division.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.division && (
                        <p className="mt-1 text-xs text-red-500">{errors.division.message}</p>
                    )}
                </div>

                <div>
                    <Label>District</Label>
                    <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                        <SelectContent>
                            {districtOptions.map((district) => (
                                <SelectItem key={district.id} value={district.name}>
                                    {district.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.district && (
                        <p className="mt-1 text-xs text-red-500">{errors.district.message}</p>
                    )}
                </div>

                <div>
                    <Label>Area / Thana</Label>
                    <Select value={selectedArea} onValueChange={handleAreaChange}>
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select area" />
                        </SelectTrigger>
                        <SelectContent>
                            {areaOptions.map((area) => (
                                <SelectItem key={area.id} value={area.name}>
                                    {area.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.area && (
                        <p className="mt-1 text-xs text-red-500">{errors.area.message}</p>
                    )}
                </div>

                <div className="sm:col-span-2">
                    <Label htmlFor="address-full">Full Address</Label>
                    <Input
                        id="address-full"
                        {...register("fullAddress")}
                        placeholder="House, road, floor"
                        className="mt-1"
                    />
                    {errors.fullAddress && (
                        <p className="mt-1 text-xs text-red-500">{errors.fullAddress.message}</p>
                    )}
                </div>

                <div className="sm:col-span-2">
                    <Label htmlFor="address-landmark">Landmark (optional)</Label>
                    <Input
                        id="address-landmark"
                        {...register("landmark")}
                        placeholder="Nearby landmark"
                        className="mt-1"
                    />
                </div>
            </div>

            {showDefaultToggle && (
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50/40 p-4 text-sm text-neutral-700">
                    <input
                        type="checkbox"
                        className="h-4 w-4 shrink-0 rounded border-brand-200 accent-brand-500"
                        checked={isDefaultChecked}
                        onChange={(event) => setValue("isDefault", event.target.checked)}
                    />
                    <span className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-brand-500" />
                        Use as my default delivery address
                    </span>
                </label>
            )}

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                )}
                <Button type="button" onClick={() => void submitForm()} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        submitLabel
                    )}
                </Button>
            </div>
        </div>
    );
}
