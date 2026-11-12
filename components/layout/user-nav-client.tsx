"use client";

import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Session } from "@/lib/auth";
import { signOut } from "@/lib/auth-client";

type Props = {
  session: Session | null;
};

export default function UserNavigationClient({ session }: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    if (pending) return;

    setPending(true);
    setError("");

    try {
      const { error: signOutError } = await signOut();

      if (signOutError) {
        setError("Could not log out. Please try again.");
        return;
      }

      setConfirmOpen(false);
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Could not log out. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (!session) {
    return (
      <Link
        href="/login"
        aria-label="Sign in"
        className={buttonVariants({ variant: "ghost", size: "icon" })}
      >
        <User />
      </Link>
    );
  }

  const { name, email } = session.user;
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Open account menu"
          render={
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="rounded-full"
            />
          }
        >
          {initials || <User />}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <span className="block truncate font-semibold">
                {name || "My account"}
              </span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {email}
              </span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              setError("");
              setConfirmOpen(true);
            }}
          >
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!pending) setConfirmOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You’ll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={() => void handleSignOut()}
            >
              {pending ? "Logging out…" : "Log out"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
