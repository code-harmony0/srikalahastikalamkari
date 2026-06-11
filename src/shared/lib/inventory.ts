import { Product } from "@/shared/types"

export const MADE_TO_ORDER_DAYS = "14-15 days"
export const MADE_TO_ORDER_MAX_QUANTITY = 10

export function getStockQuantity(product?: Pick<Product, "stock_quantity" | "quantity"> | null) {
  return Math.max(0, Number(product?.stock_quantity ?? product?.quantity ?? 0))
}

export function isMadeToOrder(product?: Pick<Product, "stock_quantity" | "quantity"> | null) {
  return getStockQuantity(product) <= 0
}

export function getPurchasableQuantityLimit(product?: Pick<Product, "stock_quantity" | "quantity"> | null) {
  const stock = getStockQuantity(product)
  return stock > 0 ? stock : MADE_TO_ORDER_MAX_QUANTITY
}

