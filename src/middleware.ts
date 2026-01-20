import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is a dashboard route (except login)
  if (pathname.startsWith('/dashboard') && pathname !== '/dashboard/login') {
    // Check if user is authenticated
    const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true'

    if (!isLoggedIn) {
      // Redirect to admin login
      const loginUrl = new URL('/dashboard/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
}
