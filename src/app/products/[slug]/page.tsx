import { Metadata } from "next"
import ProductDetail from "@/features/products/ProductDetail"
import { productsService } from "@/services/products"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await productsService.getBySlug(slug)

  if (!product) {
    return {
      title: "Product Not Found | Srikalahasti Kalamkari",
      description:
        "The requested product could not be found. Browse our collection of authentic Kalamkari sarees.",
    }
  }

  return {
    title: `${product.name} | Buy Kalamkari Saree Online`,
    description: product.description
      ? `${product.description.slice(0, 150)}...`
      : `Buy ${product.name} - Authentic Srikalahasti Kalamkari saree handcrafted with traditional techniques.`,
    alternates: {
      canonical: `https://srikalahastikalamkari.in/products/${slug}`,
    },
    openGraph: {
      title: `${product.name} | Srikalahasti Kalamkari`,
      description:
        product.description?.slice(0, 200) ||
        "Authentic handcrafted Kalamkari saree",
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  return <ProductDetail />
}
