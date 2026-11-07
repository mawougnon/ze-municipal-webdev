-- Documents sent with an application move to their own table and to a private bucket.
CREATE TABLE "ApplicationFile" (
    "path" TEXT NOT NULL,
    "applicationId" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationFile_pkey" PRIMARY KEY ("path")
);

CREATE INDEX "ApplicationFile_applicationId_idx" ON "ApplicationFile"("applicationId");
CREATE INDEX "ApplicationFile_createdAt_idx" ON "ApplicationFile"("createdAt");

ALTER TABLE "ApplicationFile" ADD CONSTRAINT "ApplicationFile_applicationId_fkey"
  FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Existing links become rows, keeping the old file name. They still point to the public
-- bucket until scripts/move-application-files.mjs has moved the files.
INSERT INTO "ApplicationFile" ("path", "applicationId", "createdAt")
SELECT regexp_replace(url, '^.*/', ''), a."id", a."createdAt"
FROM "Application" a, unnest(string_to_array(a."cvUrl", ' | ')) AS url
WHERE a."cvUrl" IS NOT NULL AND a."cvUrl" <> ''
ON CONFLICT ("path") DO NOTHING;

ALTER TABLE "Application" DROP COLUMN "cvUrl";

ALTER TABLE "ApplicationFile" ENABLE ROW LEVEL SECURITY;

-- Storage rules live here rather than in the Supabase dashboard. No policy at all on the
-- files: browsers get no right on the storage API, only one-time links issued by the server,
-- and public buckets remain readable through their public address. Plain PostgreSQL has none
-- of this and skips it.
DO $$
DECLARE
  p text;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON "ApplicationFile" FROM anon, authenticated;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
      ('photos', 'photos', true, 5242880, ARRAY['image/jpeg', 'image/png']),
      ('documents', 'documents', true, 5242880, ARRAY['application/pdf']),
      ('applications', 'applications', false, 5242880, ARRAY['application/pdf'])
    ON CONFLICT (id) DO UPDATE SET
      public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

    FOR p IN SELECT policyname FROM pg_policies
             WHERE schemaname = 'storage' AND tablename = 'objects' LOOP
      EXECUTE format('DROP POLICY %I ON storage.objects', p);
    END LOOP;
  END IF;
END $$;
