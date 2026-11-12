import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCartItems } from "@/lib/data/cart";
import { formatPrice } from "@/lib/product-utils";
import { noIndexMetadata } from "@/lib/seo";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Checkout",
  ...noIndexMetadata,
};

async function CheckoutContent() {
  const session = await getSession();

  if (!session) {
    redirect("/login?callbackUrl=%2Fcheckout");
  }

  const items = await getCartItems(session.user.id);

  if (items.length === 0) {
    redirect("/cart");
  }

  const subtotalCents = items.reduce((total, { variant, quantity }) => {
    const product = variant?.product;
    if (!product?.isActive) return total;

    const unitPriceCents = Math.round(Number(product.price) * 100);
    return total + unitPriceCents * quantity;
  }, 0);

  const needsCartReview = items.some(
    ({ variant, quantity }) =>
      !variant?.product?.isActive || quantity > variant.stock,
  );

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <section
          aria-labelledby="delivery-details"
          className="space-y-5 rounded-xl border bg-card p-6"
        >
          <h2 id="delivery-details" className="text-lg font-semibold">
            Delivery Details
          </h2>

          <div className="space-y-2">
            <Label htmlFor="contact-number">Phone number</Label>
            <Input
              id="contact-number"
              name="contactNumber"
              type="tel"
              autoComplete="tel"
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery-address">Delivery address</Label>
            <textarea
              id="delivery-address"
              name="address"
              autoComplete="street-address"
              rows={4}
              placeholder="Street address, township, and city"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>
        </section>

        <section
          aria-labelledby="payment-method"
          className="space-y-2 rounded-xl border bg-card p-6"
        >
          <h2 id="payment-method" className="text-lg font-semibold">
            Payment Method
          </h2>
          <p className="font-medium">Cash on Delivery</p>
          <p className="text-sm text-muted-foreground">
            Pay when your order arrives.
          </p>
        </section>
      </div>

      <section
        aria-labelledby="checkout-summary"
        className="space-y-4 rounded-xl border bg-card p-6"
      >
        <h2 id="checkout-summary" className="text-lg font-semibold">
          Order Summary
        </h2>

        <ul className="divide-y text-sm">
          {items.map(({ variantId, variant, quantity }) => {
            const product = variant?.product;
            const lineTotalCents = product?.isActive
              ? Math.round(Number(product.price) * 100) * quantity
              : null;

            return (
              <li key={variantId} className="flex justify-between gap-4 py-3">
                <div className="min-w-0 space-y-1">
                  <p className="font-medium">
                    {product?.name ?? "Unavailable product"} × {quantity}
                  </p>
                  {variant && (
                    <p className="text-xs text-muted-foreground">
                      {variant.size} · {variant.color}
                    </p>
                  )}
                </div>
                <span className="shrink-0">
                  {lineTotalCents === null
                    ? "Unavailable"
                    : formatPrice(lineTotalCents / 100)}
                </span>
              </li>
            );
          })}
        </ul>

        <dl className="space-y-3 border-t pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatPrice(subtotalCents / 100)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Payment</dt>
            <dd>Cash on Delivery</dd>
          </div>
          <div className="flex justify-between gap-4 border-t pt-3 font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(subtotalCents / 100)}</dd>
          </div>
        </dl>

        {needsCartReview && (
          <p role="alert" className="text-sm text-destructive">
            Some items are unavailable or exceed current stock. Update your cart
            before placing an order.
          </p>
        )}

        <Button type="button" className="w-full" disabled>
          Place Order
        </Button>
      </section>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/cart"
          className="text-sm text-muted-foreground hover:underline"
        >
          Back to cart
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      </div>

      <Suspense
        fallback={<p className="text-muted-foreground">Loading checkout…</p>}
      >
        <CheckoutContent />
      </Suspense>
    </section>
  );
}
