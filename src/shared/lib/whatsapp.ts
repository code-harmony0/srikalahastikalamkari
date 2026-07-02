import { Product } from "@/shared/types"

export const STORE_WHATSAPP_NUMBER = "917288848881"

export function getProductUrlPath(product: Pick<Product, "id" | "slug">) {
  return `/products/${product.slug || product.id}`
}

export function getProductInquiryWhatsAppUrl(
  product: Product,
  options: {
    phoneNumber?: string
    siteOrigin?: string
  } = {},
) {
  const phoneNumber = options.phoneNumber || STORE_WHATSAPP_NUMBER
  const siteOrigin = options.siteOrigin?.replace(/\/$/, "")
  const productPath = getProductUrlPath(product)
  const productLink = siteOrigin ? `${siteOrigin}${productPath}` : productPath
  const productName = product.name || product.title || "this Kalamkari design"
  const categoryName = product.categoryName || "Not specified"
  const subCategoryName = product.subCategoryName || "Not specified"

  const message = [
    "Hello, I want to request this Srikalahasti Kalamkari custom design.",
    `Product: ${productName}`,
    `Category: ${categoryName}`,
    `Subcategory: ${subCategoryName}`,
    `Product link: ${productLink}`,
    "Please share price, timeline, and customization options.",
  ].join("\n")

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
}
