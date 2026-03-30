
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


const pubilcRoutes = [
    "/",
    "/local-features",
]

export function proxy(request: NextRequest) {

    const url = request.nextUrl.clone()

    if (!pubilcRoutes.includes(url.pathname)) {
        return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.png$).*)',
  ],
}