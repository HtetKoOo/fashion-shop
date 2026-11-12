import { db } from "@/lib/prisma";

export function getCartItems(userId: string) {
  return db.orm.public.CartItem.where({ userId })
    .orderBy((item) => item.createdAt.desc())
    .include("variant", (variant) =>
      variant.include("product", (product) =>
        product.select("name", "slug", "price", "isActive"),
      ),
    )
    .all();
}

export async function getCartQuantity(userId: string) {
  const items = await db.orm.public.CartItem.select("quantity")
    .where({ userId })
    .all();

  return items.reduce((total, item) => total + item.quantity, 0);
}
