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

  // Redirect authenticated users away from admin login
  if (pathname === '/admin/login') {
    const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true'
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/login',
  ],
}
