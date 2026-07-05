import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the route is a dashboard route
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check for the crown_session cookie we set on login
    const sessionCookie = request.cookies.get('crown_session');
    
    if (!sessionCookie || !sessionCookie.value) {
      // Not logged in, redirect to login page
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};
