/*
  Warnings:

  - You are about to drop the column `customerName` on the `Queue` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serviceCenterId,tokenNumber]` on the table `Queue` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Queue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `ServiceCenter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "QueueStatus" ADD VALUE 'CANCELLED';
ALTER TYPE "QueueStatus" ADD VALUE 'EXPIRED';
ALTER TYPE "QueueStatus" ADD VALUE 'NO_SHOW';

-- AlterTable
ALTER TABLE "Queue" DROP COLUMN "customerName",
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "checkedIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "servedAt" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ServiceCenter" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "averageServiceTime" INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

-- CreateTable
CREATE TABLE "StaffAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceCenterId" TEXT NOT NULL,

    CONSTRAINT "StaffAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffAssignment_userId_serviceCenterId_key" ON "StaffAssignment"("userId", "serviceCenterId");

-- CreateIndex
CREATE INDEX "Queue_serviceCenterId_status_idx" ON "Queue"("serviceCenterId", "status");

-- CreateIndex
CREATE INDEX "Queue_userId_idx" ON "Queue"("userId");

-- CreateIndex
CREATE INDEX "Queue_tokenNumber_idx" ON "Queue"("tokenNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Queue_serviceCenterId_tokenNumber_key" ON "Queue"("serviceCenterId", "tokenNumber");

-- AddForeignKey
ALTER TABLE "StaffAssignment" ADD CONSTRAINT "StaffAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAssignment" ADD CONSTRAINT "StaffAssignment_serviceCenterId_fkey" FOREIGN KEY ("serviceCenterId") REFERENCES "ServiceCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
