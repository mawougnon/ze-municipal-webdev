import { NextResponse } from "next/server";
import type { z } from "zod";

// Vercel sets this header. Behind another proxy it could be forged.
export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
}

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function readBody<Schema extends z.ZodType>(req: Request, schema: Schema) {
  const result = schema.safeParse(await req.json().catch(() => null));
  if (!result.success) return { invalid: errorResponse(result.error.issues[0].message, 400) };
  return { data: result.data as z.output<Schema> };
}
