-- RenameEnum: applies to every model, not just User
ALTER TYPE "UserStatus" RENAME TO "Status";

-- AlterTable: soft-delete status (User already had this column under the renamed enum)
ALTER TABLE "Brand" ADD COLUMN "status" "Status" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Clipper" ADD COLUMN "status" "Status" NOT NULL DEFAULT 'ACTIVE';
