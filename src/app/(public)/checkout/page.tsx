"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, RefreshCw } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequireAuth } from "@/components/common/require-auth";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { useToastStore } from "@/store/toast.store";
import { useCreateOrder } from "@/hooks/use-orders";
import { formatPrice, cn } from "@/lib/utils";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validators/checkout";
import { getDistrictsByDivision, getDivisions, getUpazilasByDistrict } from "@/constants/bangladesh-locations";
import { shippingService } from "@/services/shipping.service";
import type { ShippingQuoteResponse } from "@/types/shipping";

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutContent />
    </RequireAuth>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    items,
    clearCart,
    totalPrice,
    canCheckout,
    getCheckoutBlockMessage,
    isSyncingCatalog,
  } = useCartStore();
  const addToast = useToastStore((state) => state.addToast);
  const createOrder = useCreateOrder();
  const [serverError, setServerError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponState, setCouponState] = useState<"idle" | "validating" | "applied" | "invalid">("idle");
  const [shippingQuote, setShippingQuote] = useState<ShippingQuoteResponse | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);
  const quoteRequestRef = useRef(0);
  const checkoutBlockMessage = getCheckoutBlockMessage();
  const canProceedToCheckout = canCheckout();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.username ?? "",
      phone: "",
      division: "",
      district: "",
      area: "",
      address: "",
      landmark: "",
    },
  });

  useEffect(() => {
    if (user?.username) {
      setValue("name", user.username);
    }
  }, [setValue, user?.username]);

  const selectedDivision = watch("division");
  const selectedDistrict = watch("district");
  const selectedArea = watch("area");
  const divisionOptions = useMemo(() => getDivisions(), []);
  const districtOptions = useMemo(() => getDistrictsByDivision(selectedDivision), [selectedDivision]);
  const areaOptions = useMemo(
    () => getUpazilasByDistrict(selectedDistrict, selectedDivision),
    [selectedDivision, selectedDistrict],
  );
  const subtotal = totalPrice();
  const discountAmount = shippingQuote?.totals.discountAmount ?? 0;
  const displayedShippingFee = shippingQuote?.totals.shippingFee ?? 0;
  const totalAmount = shippingQuote?.totals.totalAmount ?? Math.max(subtotal - discountAmount, 0);
  const deliveryAvailable = shippingQuote?.shipping.availability.available ?? false;
  const quoteLocationReady = Boolean(selectedDivision && selectedDistrict && selectedArea);

  const validationItems = useMemo(
    () =>
      items.map((item) => ({
        itemId: item.itemId || item.product.id,
        itemType:
          item.itemType ??
          item.product.itemType ??
          (item.product.category === "combo" ? ("combo" as const) : ("product" as const)),
        quantity: item.quantity,
      })),
    [items],
  );

  const fetchShippingQuote = useCallback(async (couponCode = appliedCoupon) => {
    if (!canProceedToCheckout || !quoteLocationReady) {
      setShippingQuote(null);
      setQuoteError(null);
      return;
    }

    const requestId = quoteRequestRef.current + 1;
    quoteRequestRef.current = requestId;
    setIsQuoteLoading(true);
    setQuoteError(null);
    setShippingQuote(null);

    try {
      const response = await shippingService.quote({
        items: validationItems,
        shippingAddress: {
          division: selectedDivision,
          district: selectedDistrict,
          area: selectedArea,
        },
        couponCode: couponCode || undefined,
      });

      if (quoteRequestRef.current === requestId) {
        setShippingQuote(response);
        setIsQuoteLoading(false);
      }
    } catch (requestError) {
      if (quoteRequestRef.current === requestId) {
        setShippingQuote(null);
        setIsQuoteLoading(false);
        const message = axios.isAxiosError(requestError)
          ? (requestError.response?.data?.message as string | undefined) ?? "Unable to calculate delivery."
          : requestError instanceof Error
            ? requestError.message
            : "Unable to calculate delivery.";
        setQuoteError(message);
        if (couponCode) {
          setAppliedCoupon("");
          setCouponState("invalid");
          setCouponMessage("Coupon needs to be applied again after delivery or cart changes.");
        }
      }
    }
  }, [
    appliedCoupon,
    canProceedToCheckout,
    quoteLocationReady,
    selectedArea,
    selectedDistrict,
    selectedDivision,
    validationItems,
  ]);

  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code) {
      setCouponMessage("Enter a coupon code.");
      setCouponState("invalid");
      return;
    }
    if (!quoteLocationReady) {
      setCouponMessage("Select division, district, and area before applying a coupon.");
      setCouponState("invalid");
      return;
    }

    setCouponState("validating");
    setCouponMessage(null);
    try {
      const response = await shippingService.quote({
        items: validationItems,
        shippingAddress: {
          division: selectedDivision,
          district: selectedDistrict,
          area: selectedArea,
        },
        couponCode: code,
      });
      setShippingQuote(response);
      setAppliedCoupon(response.coupon?.code ?? code.toUpperCase());
      setCouponInput(response.coupon?.code ?? code.toUpperCase());
      setCouponState("applied");
      setCouponMessage("Coupon applied.");
    } catch (requestError) {
      const message = axios.isAxiosError(requestError)
        ? (requestError.response?.data?.message as string | undefined) ?? "Coupon could not be applied."
        : requestError instanceof Error
          ? requestError.message
          : "Coupon could not be applied.";
      setShippingQuote(null);
      setAppliedCoupon("");
      setCouponState("invalid");
      setCouponMessage(message);
    }
  }

  useEffect(() => {
    if (canProceedToCheckout && quoteLocationReady) {
      void fetchShippingQuote(appliedCoupon);
    } else {
      quoteRequestRef.current += 1;
      setShippingQuote(null);
      setQuoteError(null);
      setIsQuoteLoading(false);
    }
  }, [appliedCoupon, canProceedToCheckout, fetchShippingQuote, quoteLocationReady, subtotal]);

  const onSubmit = async (values: CheckoutFormValues) => {
    if (submitLockRef.current || createOrder.isPending) {
      return;
    }

    setServerError(null);

    if (!canProceedToCheckout) {
      setServerError(
        checkoutBlockMessage ??
          "One or more items in your cart cannot be verified. Please update the cart before placing the order.",
      );
      return;
    }

    if (isQuoteLoading || !shippingQuote || !deliveryAvailable) {
      setServerError(
        shippingQuote?.shipping.availability.message ??
          quoteError ??
          "Please complete delivery information and wait for the delivery charge to update.",
      );
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    try {
      const order = await createOrder.mutateAsync({
        items: items.map((item) => ({
          itemId: item.itemId || item.product.id,
          itemType: item.itemType ?? item.product.itemType ?? (item.product.category === "combo" ? "combo" : "product"),
          title: item.product.name,
          price: item.product.price,
          thumbnail: item.product.images?.[0] ?? "",
          quantity: item.quantity,
        })),
        shippingAddress: values,
        paymentMethod: "cash_on_delivery",
        couponCode: appliedCoupon || undefined,
        quoteFingerprint: shippingQuote.quoteFingerprint,
      });

      clearCart();
      addToast(`Order ${order.orderNumber} placed successfully`, "success");
      router.push(`/order-success/${order.id}`);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 409 &&
        error.response.data?.code === "CHECKOUT_QUOTE_CHANGED"
      ) {
        const refreshedQuote = error.response.data?.quote as ShippingQuoteResponse | undefined;
        if (refreshedQuote) {
          setShippingQuote(refreshedQuote);
        } else {
          await fetchShippingQuote(appliedCoupon);
        }
        const message =
          "Delivery or order total has been updated. Please review the new total and place your order again.";
        setServerError(message);
        addToast(message, "error");
        return;
      }

      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string | undefined) ?? "Unable to place order. Please try again."
        : error instanceof Error
          ? error.message
          : "Unable to place order. Please try again.";
      setServerError(message);
      addToast(message, "error");
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-light text-neutral-800">
          Your cart is empty
        </h1>
        <p className="mt-2 text-neutral-400">
          Add some products before checking out.
        </p>
        <Link href="/shop" className="mt-4 inline-block">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/cart"
        className="mb-6 inline-flex items-center gap-1 text-sm text-brand-500 hover:underline"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to Cart
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-neutral-800">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Confirm your delivery details and place your order.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
          <div className="space-y-8">
            <Card className="border-brand-100">
              <CardContent className="p-4 sm:p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-medium text-neutral-800">
                    Shipping Information
                  </h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    Enter your delivery address to calculate shipping.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="name">Recipient Name</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Jane Doe"
                      className="mt-1"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="01XXXXXXXXX"
                      className="mt-1"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Division</Label>
                    <Select
                      value={selectedDivision}
                      onValueChange={(value) => {
                        setValue("division", value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                        setValue("district", "", { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                        setValue("area", "", { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                      }}
                    >
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
                      <p className="mt-1 text-xs text-red-500">
                        {errors.division.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>District</Label>
                    <Select
                      value={selectedDistrict}
                      onValueChange={(value) => {
                        setValue("district", value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                        setValue("area", "", { shouldDirty: true, shouldTouch: true, shouldValidate: true });
                      }}
                      disabled={!selectedDivision}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {districtOptions.map((district) => (
                          <SelectItem key={district.name} value={district.name}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.district && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.district.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Area / Thana</Label>
                    <Select
                      value={selectedArea}
                      onValueChange={(value) =>
                        setValue("area", value, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
                      }
                      disabled={!selectedDistrict}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select area / thana" />
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
                      <p className="mt-1 text-xs text-red-500">
                        {errors.area.message}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="address">Detailed Address</Label>
                    <Input
                      id="address"
                      {...register("address")}
                      placeholder="House, road, floor"
                      className="mt-1"
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="landmark">Landmark (optional)</Label>
                    <Input
                      id="landmark"
                      {...register("landmark")}
                      placeholder="Nearby landmark"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-brand-100">
              <CardContent className="p-4 sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-brand-500" />
                  <h2 className="text-lg font-medium text-neutral-800">
                    Payment Method
                  </h2>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/40 p-4">
                  <input
                    type="radio"
                    checked
                    readOnly
                    className="mt-1 h-4 w-4 border-brand-300 text-brand-500 focus:ring-brand-300"
                  />
                  <div>
                    <p className="font-medium text-neutral-800">
                      Cash on Delivery
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      Pay the rider when your order arrives.
                    </p>
                  </div>
                </label>
              </CardContent>
            </Card>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="border-brand-100">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg font-medium text-neutral-800">
                  Order Summary
                </h3>

                <div className="mt-4 divide-y divide-brand-50">
                  {items.map((item) => (
                    <div
                      key={`${item.itemType}:${item.itemId || item.product.id}`}
                      className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm min-[380px]:flex-nowrap"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 font-medium text-neutral-700">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-neutral-400">
                          Qty {item.quantity}
                        </p>
                      </div>
                      <span className="shrink-0 font-medium text-neutral-800">
                        {item.catalogStatus === "verified" &&
                        item.product.stock > 0 &&
                        item.quantity <= item.product.stock
                          ? formatPrice(item.product.price * item.quantity)
                          : "Unavailable"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2 border-t border-brand-100 pt-4">
                  <div className="flex justify-between text-sm text-neutral-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-neutral-600">
                    <span>Shipping</span>
                    <span>
                      {isQuoteLoading
                        ? "Calculating..."
                        : shippingQuote?.shipping.isFreeDelivery
                          ? "FREE"
                          : formatPrice(displayedShippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-neutral-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-brand-100 pt-3 font-medium text-neutral-800">
                    <span>Total</span>
                    <span className="text-lg text-brand-600">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t border-brand-100 pt-4">
                  <Label htmlFor="couponCode">Coupon Code</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      id="couponCode"
                      value={couponInput}
                      onChange={(event) => {
                        setCouponInput(event.target.value.toUpperCase());
                        if (couponState !== "idle") {
                          setCouponState("idle");
                          setCouponMessage(null);
                        }
                      }}
                      placeholder="MIORALAUNCH"
                    />
                    <Button type="button" variant="outline" onClick={applyCoupon} disabled={couponState === "validating" || !canProceedToCheckout}>
                      {couponState === "validating" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                  {couponMessage ? (
                    <p className={cn("mt-2 text-xs", couponState === "applied" ? "text-emerald-600" : "text-red-500")}>
                      {couponMessage}
                    </p>
                  ) : null}
                </div>

                {isSyncingCatalog && (
                  <p className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-neutral-600">
                    Refreshing cart prices and stock. Please wait before placing the order.
                  </p>
                )}

                <div className="mt-5 rounded-2xl bg-brand-50/50 p-4 text-sm text-neutral-600">
                  <div className="flex items-center gap-2 font-medium text-neutral-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Delivery timeline
                  </div>
                  <p className="mt-2">
                    {shippingQuote
                      ? `${shippingQuote.shipping.estimatedMinDays}-${shippingQuote.shipping.estimatedMaxDays} business days`
                      : "Complete your delivery address to see the estimated delivery range."}
                  </p>
                </div>

                {quoteError ? (
                  <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span>{quoteError}</span>
                      <Button type="button" variant="outline" size="sm" onClick={() => void fetchShippingQuote()}>
                        <RefreshCw className="h-3.5 w-3.5" />
                        Retry
                      </Button>
                    </div>
                  </div>
                ) : null}

                {shippingQuote && !deliveryAvailable ? (
                  <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    {shippingQuote.shipping.availability.message ?? "Delivery is unavailable for this address."}
                  </p>
                ) : null}

                {checkoutBlockMessage && !isSyncingCatalog && (
                  <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    {checkoutBlockMessage}
                  </p>
                )}

                {serverError && (
                  <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {serverError}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="mt-6 w-full"
                  disabled={
                    createOrder.isPending ||
                    isSubmitting ||
                    isQuoteLoading ||
                    !shippingQuote ||
                    !deliveryAvailable ||
                    !canProceedToCheckout
                  }
                >
                  {createOrder.isPending || isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>

                <p className="mt-3 text-center text-xs text-neutral-400">
                  By placing this order, you agree to confirm the shipping
                  address and pay cash on delivery.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
