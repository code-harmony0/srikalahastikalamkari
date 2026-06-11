import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is a dashboard route
  if (pathname.startsWith('/dashboard')) {
    // Check if user is authenticated
    const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true'

    if (!isLoggedIn) {
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
  }

  return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin',
    '/admin/login',
  ],
}
