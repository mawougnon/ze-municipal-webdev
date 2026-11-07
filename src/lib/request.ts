// Vercel sets this header. Behind another proxy it could be forged.
export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
}
