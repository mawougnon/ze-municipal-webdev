import "server-only";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-admin";

const BUCKET = "applications";
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// Uploads need no account
const MAX_UPLOADS_PER_IP_PER_HOUR = 15;
const MAX_UPLOADS_PER_HOUR = 50;

const APPLICATION_RETENTION_MS = 183 * DAY_MS;
const LOG_RETENTION_MS = 365 * DAY_MS;

export async function issueUpload(ipAddress: string | null) {
  const since = new Date(Date.now() - HOUR_MS);
  const [byIp, total] = await Promise.all([
    ipAddress
      ? prisma.applicationFile.count({ where: { ipAddress, createdAt: { gte: since } } })
      : 0,
    prisma.applicationFile.count({ where: { createdAt: { gte: since } } }),
  ]);
  if (byIp >= MAX_UPLOADS_PER_IP_PER_HOUR || total >= MAX_UPLOADS_PER_HOUR) return null;

  const path = `${randomUUID()}.pdf`;
  await prisma.applicationFile.create({ data: { path, ipAddress } });

  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) throw new Error(`Signed upload: ${error.message}`);
  return { path, token: data.token };
}

export async function signedReadUrl(path: string) {
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, 60);
  if (error) throw new Error(`Signed read: ${error.message}`);
  return data.signedUrl;
}

// Rows go last, so the next purge retries after a failure
export async function removeFiles(paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove(paths);
  if (error) throw new Error(`Remove files: ${error.message}`);
  await prisma.applicationFile.deleteMany({ where: { path: { in: paths } } });
}

export async function purgeExpiredData(now = Date.now()) {
  const { count: applications } = await prisma.application.deleteMany({
    where: { createdAt: { lt: new Date(now - APPLICATION_RETENTION_MS) } },
  });

  // Includes files of deleted applications. New uploads get a day for the form to be sent.
  const orphans = await prisma.applicationFile.findMany({
    where: { applicationId: null, createdAt: { lt: new Date(now - DAY_MS) } },
    select: { path: true },
    take: 1000,
  });
  await removeFiles(orphans.map((f) => f.path));

  const { count: logs } = await prisma.auditLog.deleteMany({
    where: { createdAt: { lt: new Date(now - LOG_RETENTION_MS) } },
  });

  if (applications || orphans.length || logs) {
    await prisma.auditLog.create({
      data: {
        action: "RETENTION_PURGE",
        target: `${applications} candidature(s), ${orphans.length} fichier(s), ${logs} ligne(s) du journal`,
        userEmail: "tâche automatique",
      },
    });
  }
  return { applications, files: orphans.length, logs };
}
