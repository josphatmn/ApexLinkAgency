import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/login', '/register', '/api', '/_next', '/favicon.ico'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('session')?.value;
  if (!token) {
    if (pathname === '/payment') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'apexlink-jwt-secret');
    const { payload } = await jwtVerify(token, secret);
    const activated = (payload as any).activated;

    if (pathname === '/payment' || pathname === '/profile') {
      return NextResponse.next();
    }

    if (!activated) {
      return NextResponse.redirect(new URL('/payment', request.url));
    }
  } catch {
    // invalid token — let it through, auth pages handle it
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|uploads|favicon.ico).*)'],
};
