import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;

  const isOnAdminDashboard = path.startsWith("/admin");
  const isOnLogin = path.startsWith("/login");

  // Hide admin routes from unauthenticated users
  if (isOnAdminDashboard && !isLoggedIn) {
    return NextResponse.rewrite(new URL("/not-found", req.nextUrl));
  }

  // Hide public login route completely
  if (isOnLogin) {
    return NextResponse.rewrite(new URL("/not-found", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/login", "/portail/:path*"],
};