/*
  Warnings:

  - The `cvFeedback` column on the `UserProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "cvEditableText" TEXT,
ADD COLUMN     "cvMimeType" TEXT,
ADD COLUMN     "education" JSONB,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "experience" JSONB,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "location" TEXT,
ADD COLUMN     "phone" TEXT,
DROP COLUMN "cvFeedback",
ADD COLUMN     "cvFeedback" TEXT[];
