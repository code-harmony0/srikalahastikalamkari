import { NextRequest, NextResponse } from "next/server"
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/shared/lib/admin-session"

const CLOUDFLARE_TIMEOUT_MS = 45_000

type CloudflareImagesResponse = {
  success?: boolean
  result?: {
    id?: string
  }
  errors?: Array<{
    code?: number
    message?: string
  }>
}

const cfErrorMessage = (data: CloudflareImagesResponse) => {
  if (data.errors?.some((error) => error.code === 5403)) {
    return "Cloudflare Images rejected the upload. Use a token for this account with Account > Cloudflare Images > Edit permission, and confirm Cloudflare Images is enabled on that account."
  }

  return data.errors
    ?.map((error) => error.message)
    .filter(Boolean)
    .join(", ") || "Cloudflare Images upload failed"
}

async function cloudflareFetch(input: string, init: RequestInit) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), CLOUDFLARE_TIMEOUT_MS)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSessionToken(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    )
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const accountId = process.env.CF_ACCOUNT_ID?.trim()
    const token = process.env.CF_IMAGES_TOKEN?.trim()

    if (!accountId || !token) {
      return NextResponse.json(
        { error: "Cloudflare Images secrets are not configured." },
        { status: 500 },
      )
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing image file" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are supported" },
        { status: 400 },
      )
    }

    const cloudflareFormData = new FormData()
    cloudflareFormData.append("file", file, file.name)

    const response = await cloudflareFetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: cloudflareFormData,
      },
    )

    const data = (await response.json().catch(
      () => ({}),
    )) as CloudflareImagesResponse

    if (!response.ok || !data.success || !data.result?.id) {
      return NextResponse.json(
        { error: cfErrorMessage(data) },
        { status: response.status || 502 },
      )
    }

    return NextResponse.json({
      imageId: data.result.id,
      url: data.result.id,
    })
  } catch (error: unknown) {
    const message =
      error instanceof DOMException && error.name === "AbortError"
        ? "Cloudflare image upload timed out."
        : error instanceof Error
          ? error.message
          : "Cloudflare Images upload failed"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
