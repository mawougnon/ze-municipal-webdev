-- When the applicant accepted that the data is stored outside Benin. Empty on applications
-- sent before the form asked.
ALTER TABLE "Application" ADD COLUMN "consentAt" TIMESTAMP(3);
