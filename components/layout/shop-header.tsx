import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getSession } from "@/lib/session";


import { CATEGORIES } from "@/lib/product-utils";
import UserNavigation from "./user-nav";
import { getCartQuantity } from "@/lib/data/cart";

export default async function ShopHeader() {
  const session = await getSession();
  const quantity = session ? await getCartQuantity(session.user.id) : 0;
  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Fashion Shop
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {CATEGORIES.map((category) => (
            <Link
              key={category.value}
              href={`/categories/${category.value}`}
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {category.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link
            href="/cart"
            aria-label={`Shopping cart, ${quantity} items`}
            className="relative inline-flex size-10 items-center justify-center rounded-md hover:bg-muted"
          >
            <ShoppingBag className="size-5" />
            {quantity > 0 && (
              <span className="absolute right-0 top-0 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] leading-4 text-primary-foreground">
                {quantity}
              </span>
            )}
          </Link>
          <UserNavigation />
        </div>
      </div>
    </header>
  );
}
