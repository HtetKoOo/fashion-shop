import Link from "next/link";

import { CATEGORIES } from "@/lib/product-utils";
import UserNavigation from "./user-nav";

export default function ShopHeader() {
    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 gap-4">
                <Link href="/" className="text-lg font-semibold tracking-tight">Fashion Shop</Link>
                <nav className="hidden md:flex items-center gap-1">
                    {CATEGORIES.map((category) => (
                        <Link key={category.value} href={`/categories/${category.value}`} className="rounded-md px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground ">{category.label}</Link>
                    ))}
                </nav>
                <div className="flex items-center gap-4">
                    <Link href="/cart" className="rounded-md px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground ">Cart</Link>
                    <UserNavigation />
                </div>
            </div>
        </header>
    )
}