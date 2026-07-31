import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:5000";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const target = `${backendUrl}${pathname}${search}`;
    return NextResponse.rewrite(target);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
