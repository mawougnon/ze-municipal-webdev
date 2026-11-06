-- The activity tracking is replaced by documents. Dropping these tables deletes their rows:
-- export "PtaActivity" before applying this to a database that holds real data.
DROP TABLE "PtaActivity";
DROP TABLE "PtaDocument";

CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Document_published_date_idx" ON "Document"("published", "date");

-- Same rule as every table: closed to the Supabase API roles
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON "Document" FROM anon, authenticated;
  END IF;
END $$;
