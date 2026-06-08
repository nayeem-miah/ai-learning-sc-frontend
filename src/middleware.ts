import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("user_role")?.value?.toLowerCase();
  const { pathname } = request.nextUrl;

  if (!token) {
    if (pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/" || pathname === "/login") {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else if (role === "teacher") {
      return NextResponse.redirect(new URL("/teacher/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    const redirectPath =
      role === "teacher" ? "/teacher/dashboard" : "/student/dashboard";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (pathname.startsWith("/teacher") && role === "student") {
    return NextResponse.redirect(new URL("/student/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
  ],
};
