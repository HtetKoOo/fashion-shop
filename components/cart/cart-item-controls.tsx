"use client";

import { useState, useTransition } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";

import { changeCartItemAction } from "@/app/actions/cart";
import { Button } from "@/components/ui/button";

type Props = {
  variantId: string;
  quantity: number;
  canIncrease: boolean;
};

export default function CartItemControls({
  variantId,
  quantity,
  canIncrease,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function change(operation: "increase" | "decrease" | "remove") {
    setError("");

    startTransition(async () => {
      try {
        const result = await changeCartItemAction({ variantId, operation });
        if (!result.success) {
          setError(result.error ?? "Could not update your cart.");
        }
      } catch {
        setError("Could not update your cart. Try again.");
      }
    });
  }

  return (
    <div className="space-y-1" aria-busy={pending}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Decrease quantity"
          disabled={pending || quantity <= 1}
          onClick={() => change("decrease")}
        >
          <Minus />
        </Button>

        <span className="min-w-6 text-center tabular-nums" aria-live="polite">
          {quantity}
        </span>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Increase quantity"
          disabled={pending || !canIncrease}
          onClick={() => change("increase")}
        >
          <Plus />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Remove item"
          disabled={pending}
          onClick={() => change("remove")}
        >
          <Trash2 />
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
