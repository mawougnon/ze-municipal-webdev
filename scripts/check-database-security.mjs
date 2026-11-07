// Read-only. Fails if a table or a file can be reached through the Supabase API.
// Usage: npm run db:check-security
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const problems = [];

try {
  const noRls = await prisma.$queryRaw`
    SELECT c.relname AS name FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity`;
  for (const { name } of noRls) problems.push(`table "${name}": row level security is off`);

  const policies = await prisma.$queryRaw`
    SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public'`;
  for (const p of policies)
    problems.push(`table "${p.tablename}": unexpected policy "${p.policyname}"`);

  const grants = await prisma.$queryRaw`
    SELECT grantee, table_name, string_agg(privilege_type, ', ') AS privileges
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated')
    GROUP BY grantee, table_name`;
  for (const g of grants)
    problems.push(`table "${g.table_name}": ${g.grantee} can ${g.privileges}`);

  // Plain PostgreSQL has no storage schema
  const [{ storage }] =
    await prisma.$queryRaw`SELECT to_regclass('storage.buckets')::text AS storage`;
  if (storage) {
    const storagePolicies = await prisma.$queryRaw`
      SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'`;
    for (const p of storagePolicies) problems.push(`storage: unexpected policy "${p.policyname}"`);

    const [applications] = await prisma.$queryRaw`
      SELECT public FROM storage.buckets WHERE id = 'applications'`;
    if (applications?.public !== false)
      problems.push("storage: applications bucket is not private");
  }
} finally {
  await prisma.$disconnect();
}

if (problems.length) {
  console.error(`Database security check failed:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(
  "Database security check passed: tables and files are closed to the Supabase API roles.",
);
