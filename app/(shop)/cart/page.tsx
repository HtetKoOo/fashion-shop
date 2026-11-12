import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import CartItemControls from "@/components/cart/cart-item-controls";
import { getCartItems } from "@/lib/data/cart";
import { formatPrice } from "@/lib/product-utils";
import { noIndexMetadata } from "@/lib/seo";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Shopping Cart",
  ...noIndexMetadata,
};

async function CartContents() {
  const session = await getSession();
  if (!session) redirect("/login?callbackUrl=%2Fcart");

  const items = await getCartItems(session.user.id);

  if (items.length === 0) {
    return (
      <div className="space-y-3 rounded-xl border p-6">
        <p>Your cart is empty.</p>
        <Link href="/" className="underline underline-offset-4">
          Continue shopping
        </Link>
      </div>
    );
  }

  const subtotalCents = items.reduce((total, { variant, quantity }) => {
    const product = variant?.product;
    if (!product?.isActive) return total;

    const unitPriceCents = Math.round(Number(product.price) * 100);
    return total + unitPriceCents * quantity;
  }, 0);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <ul className="space-y-4">
        {items.map(({ variantId, variant, quantity }) => {
          const product = variant?.product;
          const canIncrease = Boolean(
            product?.isActive &&
            variant &&
            quantity < Math.min(variant.stock, 99),
          );

          return (
            <li
              key={variantId}
              className="flex gap-4 rounded-xl border bg-card p-4 sm:p-6"
            >
              {variant?.imageUrl && (
                <Image
                  src={variant.imageUrl}
                  alt=""
                  width={112}
                  height={112}
                  className="size-20 shrink-0 rounded-lg object-cover sm:size-28"
                />
              )}

              <div className="min-w-0 space-y-2">
                {product?.isActive ? (
                  <Link
                    href={`/products/${product.slug}`}
                    className="font-medium hover:underline"
                  >
                    {product.name}
                  </Link>
                ) : (
                  <p className="font-medium">
                    {product?.name ?? "Unavailable product"}
                  </p>
                )}

                {variant && (
                  <p className="text-sm text-muted-foreground">
                    Size: {variant.size} · Color: {variant.color}
                  </p>
                )}

                {product?.isActive ? (
                  <p className="font-medium">
                    {formatPrice(Number(product.price))}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Unavailable</p>
                )}

                {product?.isActive && variant && quantity > variant.stock && (
                  <p className="text-sm text-destructive">
                    Only {variant.stock} in stock.
                  </p>
                )}

                <CartItemControls
                  variantId={variantId}
                  quantity={quantity}
                  canIncrease={canIncrease}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <section
        aria-labelledby="order-summary"
        className="space-y-4 rounded-xl border bg-card p-6"
      >
        <h2 id="order-summary" className="text-lg font-semibold">
          Order Summary
        </h2>

        <dl className="space-y-3 text-sm">
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

        <Link
          href="/checkout"
          className="block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Proceed to Checkout
        </Link>
      </section>
    </div>
  );
}

export default function CartPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
      <Suspense
        fallback={<p className="text-muted-foreground">Loading your cart…</p>}
      >
        <CartContents />
      </Suspense>
    </section>
  );
}
