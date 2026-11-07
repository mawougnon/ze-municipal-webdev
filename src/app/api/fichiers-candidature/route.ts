import { NextResponse } from "next/server";
import { issueUpload } from "@/lib/application-files";
import { clientIp } from "@/lib/request";

export async function POST(req: Request) {
  try {
    const upload = await issueUpload(clientIp(req.headers));
    if (!upload) {
      return NextResponse.json({ error: "Trop d’envois. Réessayez plus tard." }, { status: 429 });
    }
    return NextResponse.json(upload, { status: 201 });
  } catch (error) {
    console.error("APPLICATION_FILE_ERROR", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
