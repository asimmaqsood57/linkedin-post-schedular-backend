-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "linkedinPostId" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "LinkedinAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "linkedinId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "profileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedinAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LinkedinAccount_linkedinId_key" ON "LinkedinAccount"("linkedinId");

-- CreateIndex
CREATE INDEX "LinkedinAccount_userId_idx" ON "LinkedinAccount"("userId");

-- CreateIndex
CREATE INDEX "Post_scheduledAt_idx" ON "Post"("scheduledAt");

-- AddForeignKey
ALTER TABLE "LinkedinAccount" ADD CONSTRAINT "LinkedinAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
