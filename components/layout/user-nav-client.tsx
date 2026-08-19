"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { User } from "lucide-react";

type UserNavigationClientProps = {
    session: any;
}

export function UserNavigationClient({ session }: UserNavigationClientProps) {

    if (!session) {
        return (
            <Button variant="ghost" size="icon">
                <Link href="/login">
                    <User />
                </Link>
            </Button>
        )
    }

    return <div>User</div>
}

