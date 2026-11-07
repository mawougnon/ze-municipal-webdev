import "server-only";
import type { Prisma } from "@prisma/client";
import type { Session } from "next-auth";
import { clientIp } from "@/lib/request";

// Call inside the transaction of the change
export function logAdminAction(
  tx: Prisma.TransactionClient,
  session: Session,
  req: Request,
  action: string,
  target: string,
) {
  return tx.auditLog.create({
    data: {
      action,
      target,
      userEmail: session.user.email ?? "inconnu",
      ipAddress: clientIp(req.headers),
    },
  });
}

export function logSave(
  tx: Prisma.TransactionClient,
  session: Session,
  req: Request,
  kind: "ARTICLE" | "DOCUMENT" | "OPPORTUNITY",
  saved: { title: string; published: boolean },
) {
  const state = saved.published ? "ONLINE" : "DRAFT";
  return logAdminAction(tx, session, req, `${kind}_SAVED_${state}`, saved.title);
}
