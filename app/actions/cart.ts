"use server";

import { refresh, revalidatePath } from "next/cache";
import z from "zod";

import { db } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { addToCartSchema } from "@/lib/validations/cart";

const cartChangeSchema = z.object({
  variantId: z.string().min(1),
  operation: z.enum(["increase", "decrease", "remove"]),
});

type CartChange =
  | { operation: "increase"; quantity: number; createIfMissing: boolean }
  | { operation: "decrease" }
  | { operation: "remove" };

async function changeCart(
  userId: string,
  variantId: string,
  change: CartChange,
) {
  try {
    const result = await db.transaction(async (tx) => {
      // Serialize cart writes for the same user across requests and tabs.
      await tx
        .query(
          tx.sql.public.user
            .select("id")
            .where((user, fns) => fns.eq(user.id, userId))
            .forUpdate()
            .build(),
        )
        .toArray();

      const items = tx.orm.public.CartItem;
      const key = { userId, variantId };

      if (change.operation === "remove") {
        await items.where(key).delete();
        return { success: true as const };
      }

      const item = await items.where(key).first();

      if (change.operation === "decrease") {
        if (!item || item.quantity <= 1) {
          return { success: false as const, error: "Minimum quantity is 1." };
        }

        await items.where(key).update({ quantity: item.quantity - 1 });
        return { success: true as const };
      }

      if (!item && !change.createIfMissing) {
        return {
          success: false as const,
          error: "This item is no longer in your cart.",
        };
      }

      const variant = await tx.orm.public.ProductVariant.where({
        id: variantId,
      })
        .include("product", (product) => product.select("isActive"))
        .first();

      if (!variant?.product?.isActive) {
        return {
          success: false as const,
          error: "This product is unavailable.",
        };
      }

      const quantity = (item?.quantity ?? 0) + change.quantity;

      if (quantity > Math.min(variant.stock, 99)) {
        return {
          success: false as const,
          error: "Quantity exceeds the available stock or cart limit.",
        };
      }

      if (item) {
        await items.where(key).update({ quantity });
      } else {
        await items.create({ ...key, quantity });
      }

      return { success: true as const };
    });

    if (result.success) {
      revalidatePath("/cart");
      refresh();
    }

    return result;
  } catch {
    return {
      success: false as const,
      error: "Could not update your cart. Try again.",
    };
  }
}

export async function addToCartAction(input: unknown) {
  const session = await getSession();
  if (!session) return { success: false, error: "unauthenticated" };

  const parsed = addToCartSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  return changeCart(session.user.id, parsed.data.variantId, {
    operation: "increase",
    quantity: parsed.data.quantity,
    createIfMissing: true,
  });
}

export async function changeCartItemAction(input: unknown) {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in again." };

  const parsed = cartChangeSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid cart action." };

  const { variantId, operation } = parsed.data;

  return changeCart(
    session.user.id,
    variantId,
    operation === "increase"
      ? { operation, quantity: 1, createIfMissing: false }
      : { operation },
  );
}
