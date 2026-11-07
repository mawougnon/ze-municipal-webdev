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
