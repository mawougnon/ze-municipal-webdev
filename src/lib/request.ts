// On Vercel, x-forwarded-for is set by the platform and starts with the visitor's IP.
// Behind another proxy, this header would have to be trusted again explicitly.
export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
}
