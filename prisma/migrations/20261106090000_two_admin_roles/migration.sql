-- Every account administers the site, so USER meant nothing. The cast below stops the
-- migration if an account still has that role: it must be given a real role or removed by
-- a person, not promoted silently.
ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SUPERADMIN');

ALTER TABLE "User"
  ALTER COLUMN "role" DROP DEFAULT,
  ALTER COLUMN "role" TYPE "Role" USING ("role"::text::"Role"),
  ALTER COLUMN "role" SET DEFAULT 'ADMIN';

DROP TYPE "Role_old";
