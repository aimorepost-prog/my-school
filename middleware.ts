import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  isAdminAuthConfigured,
  verifySessionToken,
} from "@/lib/admin-auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/admin/login/api";
  const isLogout = pathname === "/admin/logout";
  const isAdminRoute = pathname.startsWith("/admin");
  const isExportApi = pathname.startsWith("/api/export");

  const needsAuth =
    (isAdminRoute && !isLoginPage && !isLoginApi && !isLogout) || isExportApi;

  if (!needsAuth) {
    return NextResponse.next();
  }

  if (!isAdminAuthConfigured()) {
    if (isLoginPage || isLoginApi) {
      return NextResponse.next();
    }
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("error", "not_configured");
    return NextResponse.redirect(url);
  }

  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const authenticated = await verifySessionToken(token);

  if (authenticated) {
    if (isLoginPage) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (isLoginPage || isLoginApi) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", req.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/export"],
};
