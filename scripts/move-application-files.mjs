// One-off, after the private_application_files migration: moves the documents of existing
// applications from the public bucket to the private one, under a random name that keeps
// nothing of the applicant's name. Safe to run again.
// Without --delete-unused it only reports. With it, it also deletes every file of the public
// buckets that no page uses (documents left behind by old applications).
// Usage: node scripts/move-application-files.mjs [--delete-unused]
// Targets the project in DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const storage = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY).storage;

async function listAll(bucket) {
  const names = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await storage.from(bucket).list("", { limit: 1000, offset });
    if (error) throw new Error(`${bucket}: ${error.message}`);
    names.push(...data.filter((f) => f.id).map((f) => f.name));
    if (data.length < 1000) return names;
  }
}

try {
  const rows = await prisma.applicationFile.findMany({ where: { applicationId: { not: null } } });
  const toMove = rows.filter((row) => !/^[0-9a-f-]{36}\.pdf$/.test(row.path));

  let moved = 0;
  const notMoved = [];
  for (const row of toMove) {
    const path = `${randomUUID()}.pdf`;
    const { error } = await storage
      .from("documents")
      .move(decodeURIComponent(row.path), path, { destinationBucket: "applications" });
    if (error) {
      notMoved.push(decodeURIComponent(row.path));
      console.warn(`Not moved (${error.message}): application ${row.applicationId}`);
    } else {
      await prisma.applicationFile.update({ where: { path: row.path }, data: { path } });
      moved++;
    }
  }
  console.log(
    `Private bucket: ${moved} moved, ${notMoved.length} not moved, ${rows.length - toMove.length} already there.`,
  );

  const articles = await prisma.article.findMany({
    select: { coverImageUrl: true, photos: { select: { url: true } } },
  });
  const documents = await prisma.document.findMany({ select: { fileUrl: true } });
  const used = {
    photos: articles.flatMap((a) => [a.coverImageUrl, ...a.photos.map((p) => p.url)]),
    documents: documents.map((d) => d.fileUrl),
  };

  for (const bucket of ["photos", "documents"]) {
    const prefix = `${url.replace(/\/+$/, "")}/storage/v1/object/public/${bucket}/`;
    const kept = new Set(
      used[bucket]
        .filter((u) => u?.startsWith(prefix))
        .map((u) => decodeURIComponent(u.slice(prefix.length))),
    );
    // A document that could not be moved stays where it is, whatever the option says
    if (bucket === "documents") notMoved.forEach((name) => kept.add(name));
    const unused = (await listAll(bucket)).filter((name) => !kept.has(name));
    console.log(`${bucket}: ${kept.size} used, ${unused.length} unused.`);
    if (process.argv.includes("--delete-unused") && unused.length) {
      const { error } = await storage.from(bucket).remove(unused);
      if (error) throw new Error(`${bucket}: ${error.message}`);
      console.log(`${bucket}: ${unused.length} deleted.`);
    }
  }
} finally {
  await prisma.$disconnect();
}
