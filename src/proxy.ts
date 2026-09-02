import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from '@/shared/lib/admin-session'
import { SITE_OFFLINE } from '@/shared/config/site-status'

/**
 * API routes that are reachable without an admin session. Everything else under
 * /api requires one — previously the whole /api tree was waved through, so the
 * upload and debug endpoints were open to the internet.
 */
const PUBLIC_API_ROUTES = [
  '/api/admin/login',
  '/api/admin/logout',
  '/api/razorpay/create-order',
  '/api/razorpay/verify-payment',
]

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Site taken offline: every route serves the unavailable notice at `/`,
  // including the dashboard and the API. Flip SITE_OFFLINE to restore.
  if (SITE_OFFLINE) {
    if (pathname === '/') {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Allow the root page (Coming Soon)
  if (pathname === '/') {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api')) {
    if (isPublicApiRoute(pathname)) {
      return NextResponse.next()
    }

    const session = await verifyAdminSessionToken(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    )

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.next()
  }

  // Check if the route is a dashboard route
  if (pathname.startsWith('/dashboard')) {
    const session = await verifyAdminSessionToken(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    )

    if (!session) {
      // Redirect to admin login
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Handle /admin and /admin/login
  if (pathname === '/admin' || pathname === '/admin/login') {
    // /admin → /admin/login
    if (pathname === '/admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // REDIRECT EVERYTHING ELSE TO THE COMING SOON PAGE (/)
  // return NextResponse.redirect(new URL('/', request.url))
  return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
  // Match all paths except static assets
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|patterns|icon|manifest).*)',
  ],
}
