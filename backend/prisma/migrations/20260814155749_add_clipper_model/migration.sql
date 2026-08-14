-- CreateTable
CREATE TABLE "Clipper" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clipper_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clipper_userId_key" ON "Clipper"("userId");

-- AddForeignKey
ALTER TABLE "Clipper" ADD CONSTRAINT "Clipper_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: move existing clipper names from User into Clipper before the column is dropped
INSERT INTO "Clipper" ("id", "name", "userId", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "name", "id", now(), now()
FROM "User"
WHERE "role" = 'CLIPPER' AND "name" IS NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name";
