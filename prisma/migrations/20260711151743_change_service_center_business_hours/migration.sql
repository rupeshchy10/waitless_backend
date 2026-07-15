/*
  Warnings:

  - You are about to drop the column `closingTime` on the `ServiceCenter` table. All the data in the column will be lost.
  - You are about to drop the column `openingTime` on the `ServiceCenter` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ServiceCenter" DROP COLUMN "closingTime",
DROP COLUMN "openingTime",
ADD COLUMN     "closingHour" INTEGER NOT NULL DEFAULT 16,
ADD COLUMN     "closingMinute" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "openingHour" INTEGER NOT NULL DEFAULT 9,
ADD COLUMN     "openingMinute" INTEGER NOT NULL DEFAULT 0;
