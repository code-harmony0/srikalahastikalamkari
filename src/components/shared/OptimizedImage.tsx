"use client"

import React, { memo, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { cn } from "@/shared/utils"
import {
  getResponsiveSizes,
  IMAGE_SIZES,
  BLUR_DATA_URL,
} from "@/lib/image-utils"
import {
  isCloudflareDeliveryUrl,
  isLocalOrPreviewImage,
  getProductImageDebugInfo,
  isProductImageDebugEnabled,
  PRODUCT_IMAGE_PLACEHOLDER,
  resolveProductImageSrc,
  type CfImageVariant,
} from "@/lib/cloudflare-images"
import { ProductImageTiers } from "@/shared/types"

const warned = new Set<string>()

interface OptimizedImageProps {
  src: string | null | undefined | ProductImageTiers
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  loading?: "lazy" | "eager"
  sizes?: string
  imageType?:
    | "thumbnail"
    | "productCard"
    | "productCardCompact"
    | "productHero"
    | "productDetail"
    | "cartItem"
    | "category"
  layout?: "grid" | "list" | "detail" | "hero"
  quality?: number
  onClick?: () => void
  onError?: () => void
  placeholder?: "blur" | "empty"
  variant?: CfImageVariant
  context?: "default" | "zoom"
  hidden?: boolean
  unmountOnHide?: boolean
  objectFit?: React.CSSProperties["objectFit"]
}

/**
 * OptimizedImage component with built-in responsive srcSet, lazy loading, and error handling.
 * Automatically applies appropriate image sizes based on imageType prop.
 */
export const OptimizedImage = memo(
  ({
    src,
    alt,
    width,
    height,
    fill = false,
    className,
    priority = false,
    loading = "lazy",
    sizes: customSizes,
    imageType = "productCard",
    layout = "grid",
    quality,
    onClick,
    onError,
    placeholder = "blur",
    variant,
    context = "default",
    hidden,
    unmountOnHide = false,
    objectFit = "cover",
  }: OptimizedImageProps) => {
    const resolvedVariant = useMemo<CfImageVariant>(() => {
      if (variant) return variant

      if (typeof src === "object" && src !== null) {
        const tierMap = {
          thumbnail: "thumb",
          productCard: "thumb",
          productCardCompact: "thumb",
          productHero: "medium",
          productDetail: "medium",
          cartItem: "thumb",
          category: "thumb",
        } as const
        return tierMap[imageType || "productCard"]
      }

      const typeMap = {
        thumbnail: "thumb",
        productCard: "thumb",
        productCardCompact: "thumb",
        productHero: "medium",
        productDetail: "medium",
        cartItem: "thumb",
        category: "thumb",
      } as const
      return typeMap[imageType || "productCard"]
    }, [imageType, src, variant])

    if (
      process.env.NODE_ENV !== "production" &&
      resolvedVariant === "full" &&
      context !== "zoom" &&
      !warned.has(`full:${alt}`)
    ) {
      warned.add(`full:${alt}`)
      console.warn(
        "[OptimizedImage] variant=\"full\" used outside zoom context. This can waste bandwidth in production.",
        { alt },
      )
    }

    const rawRef = useMemo(() => {
      if (!src) return null
      if (typeof src === "object") {
        return src[resolvedVariant] || null
      }
      return src
    }, [resolvedVariant, src])

    const resolvedSrc = useMemo(
      () => resolveProductImageSrc(rawRef, resolvedVariant),
      [rawRef, resolvedVariant],
    )

    const [imgSrc, setImgSrc] = useState<string>(resolvedSrc)
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
      setHasError(false)
      setImgSrc(resolvedSrc)
    }, [resolvedSrc])

    useEffect(() => {
      if (!isProductImageDebugEnabled()) return

      console.info("[image-debug][OptimizedImage]", {
        alt,
        imageType,
        context,
        requestedVariant: variant,
        resolvedVariant,
        rawSrcType: typeof src,
        debug: getProductImageDebugInfo(rawRef, resolvedVariant),
      })
    }, [alt, context, imageType, rawRef, resolvedSrc, resolvedVariant, src, variant])

    const handleError = () => {
      if (!hasError) {
        setHasError(true)
        setImgSrc(PRODUCT_IMAGE_PLACEHOLDER)
        if (isProductImageDebugEnabled()) {
          console.error("[image-debug][OptimizedImage:error]", {
            alt,
            imageType,
            resolvedVariant,
            failedSrc: imgSrc,
            fallback: PRODUCT_IMAGE_PLACEHOLDER,
          })
        }
        onError?.()
      }
    }

    // Determine sizes attribute
    const sizes = customSizes || getResponsiveSizes(layout)

    const isPreviewSource = isLocalOrPreviewImage(imgSrc) && !imgSrc.startsWith("/")
    const canUseNextImage =
      !isPreviewSource &&
      (imgSrc.startsWith("/") ||
        isCloudflareDeliveryUrl(imgSrc) ||
        imgSrc.includes("supabase.co/storage") ||
        imgSrc.includes("images.unsplash.com") ||
        imgSrc.includes("wixstatic.com") ||
        imgSrc.includes("via.placeholder.com") ||
        imgSrc.includes("picsum.photos"))

    const nativeStyle: React.CSSProperties = fill
      ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit }
      : { width, height, objectFit }

    if (unmountOnHide && hidden) return null

    if (hasError || !canUseNextImage) {
      return (
        <img
          src={imgSrc || PRODUCT_IMAGE_PLACEHOLDER}
          alt={alt}
          className={cn("w-full h-full object-cover", className)}
          style={nativeStyle}
          loading={loading}
          decoding="async"
          onClick={onClick}
          onError={handleError}
          hidden={hidden}
        />
      )
    }

    return (
      <Image
        src={imgSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={cn("transition-opacity duration-300", className)}
        priority={priority}
        loading={priority ? undefined : loading}
        sizes={sizes}
        quality={quality || IMAGE_SIZES[imageType].quality}
        unoptimized={isCloudflareDeliveryUrl(imgSrc)}
        placeholder={placeholder}
        blurDataURL={placeholder === "blur" ? BLUR_DATA_URL : undefined}
        onClick={onClick}
        onError={handleError}
        hidden={hidden}
        style={{
          objectFit,
        }}
      />
    )
  },
)

OptimizedImage.displayName = "OptimizedImage"
