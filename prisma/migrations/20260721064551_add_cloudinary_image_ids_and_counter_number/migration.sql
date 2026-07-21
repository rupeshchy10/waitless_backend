-- AlterTable
ALTER TABLE "ServiceCenter" ADD COLUMN     "counterNumber" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "logoId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileImageId" TEXT;
