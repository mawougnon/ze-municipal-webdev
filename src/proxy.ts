import { auth } from "@/auth";
import { type NextRequest, NextResponse } from "next/server";

const isDev = process.env.NODE_ENV !== "production";

// A new random nonce for every request: only scripts that carry it can run, so a script
// injected into a page cannot execute. Next.js reads it from the request header below
// and adds it to its own scripts.
function contentSecurityPolicy(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Style attributes cannot carry a nonce, and injected CSS cannot run code
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data: blob: https://*.supabase.co",
    "connect-src 'self' https://*.supabase.co",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

function respond(req: NextRequest, hidden = false) {
  const nonce = btoa(crypto.randomUUID());
  const csp = contentSecurityPolicy(nonce);
  const headers = new Headers(req.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);

  const response = hidden
    ? NextResponse.rewrite(new URL("/not-found", req.nextUrl), { request: { headers } })
    : NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

// Admin pages look like a 404 for anonymous visitors.
// Each admin page also checks the session itself (lib/admin.ts).
const adminProxy = auth((req) => respond(req, !req.auth));

export default function proxy(req: NextRequest) {
  // Reading the session sets cookies, so only admin pages do it: visitors of the public
  // site receive none.
  if (req.nextUrl.pathname.startsWith("/admin")) {
    return adminProxy(req, { params: Promise.resolve({}) });
  }
  return respond(req);
}

export const config = {
  // Every page, prefetches included; not the API, build assets or public images
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
