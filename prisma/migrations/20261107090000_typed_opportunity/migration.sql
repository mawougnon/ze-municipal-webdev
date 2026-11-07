CREATE TYPE "OpportunityType" AS ENUM ('JOB', 'TRAINING');

ALTER TABLE "Opportunity"
  ALTER COLUMN "type" TYPE "OpportunityType" USING ("type"::"OpportunityType"),
  ALTER COLUMN "price" TYPE INTEGER USING (round("price")::integer);
