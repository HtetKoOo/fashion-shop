import { Suspense } from "react";
import { connection } from "next/server";

import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ShopHeader from "@/components/layout/shop-header";

function ShopLayoutFallback() {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
                <div className="flex h-16 items-center justify-between px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 gap-4">
                    <Skeleton className="h-6 w-32 rounded-md" />
                    <div className="flex items-center gap-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-6 w-16 rounded-md" />
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="size-9 rounded-full" />
                        <Skeleton className="size-9  rounded-full" />
                    </div>
                </div>
            </header>
            <main></main>
        </div>
    )
}

async function ShopShell({ children }: { children: React.ReactNode }) {
    await connection();
    const session = await getSession();

    return (
        <div>
            <ShopHeader />
            {children}
        </div>
    )
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Suspense fallback={<ShopLayoutFallback />}>
                <ShopShell>{children}</ShopShell>
            </Suspense>
        </div>
    )
}