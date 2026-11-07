// Creates the first account, or restores access.
// Usage: npm run db:create-admin -- person@example.com "Full Name" [ADMIN|SUPERADMIN]
import { PrismaClient } from "@prisma/client";

const [rawEmail, name, role = "SUPERADMIN"] = process.argv.slice(2);
const email = rawEmail?.trim().toLowerCase();

if (!email?.includes("@") || !name?.trim() || !["ADMIN", "SUPERADMIN"].includes(role)) {
  console.error(
    'Usage: npm run db:create-admin -- person@example.com "Full Name" [ADMIN|SUPERADMIN]',
  );
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  await prisma.$transaction([
    prisma.user.upsert({
      where: { email },
      update: { name: name.trim(), role },
      create: { email, name: name.trim(), role },
    }),
    prisma.auditLog.create({
      data: { action: "ACCOUNT_CREATED", target: `${email} (${role})`, userEmail: "script" },
    }),
  ]);
  console.log(`Account ready: ${email} (${role})`);
} finally {
  await prisma.$disconnect();
}
