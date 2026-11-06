import { purgeExpiredData } from "@/lib/application-files";
import { NextResponse } from "next/server";

// Called once a day by Vercel (vercel.json), which sends CRON_SECRET in this header
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  return NextResponse.json(await purgeExpiredData());
}
