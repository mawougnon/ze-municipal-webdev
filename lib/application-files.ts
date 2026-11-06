import "server-only";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-admin";

const BUCKET = "applications";
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// An upload needs no account, so these limits are what stops a visitor from filling the storage
const MAX_UPLOADS_PER_IP_PER_HOUR = 15;
const MAX_UPLOADS_PER_HOUR = 50;

const APPLICATION_RETENTION_MS = 183 * DAY_MS; // 6 months
const LOG_RETENTION_MS = 365 * DAY_MS;

// Returns a one-time link to send one PDF to the private bucket, or null over the limits.
export async function issueUpload(ipAddress: string | null) {
  const since = new Date(Date.now() - HOUR_MS);
  const [byIp, total] = await Promise.all([
    ipAddress
      ? prisma.applicationFile.count({ where: { ipAddress, createdAt: { gte: since } } })
      : 0,
    prisma.applicationFile.count({ where: { createdAt: { gte: since } } }),
  ]);
  if (byIp >= MAX_UPLOADS_PER_IP_PER_HOUR || total >= MAX_UPLOADS_PER_HOUR) return null;

  // A random name: the file cannot be guessed and keeps nothing of the applicant's file name
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

// The rows go only once the files are gone: after a failure the next purge tries again
export async function removeFiles(paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove(paths);
  if (error) throw new Error(`Remove files: ${error.message}`);
  await prisma.applicationFile.deleteMany({ where: { path: { in: paths } } });
}

// Run once a day. What the privacy policy promises does not depend on someone opening a page.
export async function purgeExpiredData(now = Date.now()) {
  const { count: applications } = await prisma.application.deleteMany({
    where: { createdAt: { lt: new Date(now - APPLICATION_RETENTION_MS) } },
  });

  // Without an application: its application was deleted (with its offer, or by the purge
  // above), or the applicant uploaded and never sent the form. A day leaves them the time.
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
