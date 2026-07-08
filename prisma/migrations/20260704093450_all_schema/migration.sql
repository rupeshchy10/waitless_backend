-- CreateEnum
CREATE TYPE "QueuePriority" AS ENUM ('NORMAL', 'VIP', 'EMERGENCY');

-- AlterTable
ALTER TABLE "Queue" ADD COLUMN     "priority" "QueuePriority" NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "ServiceCenter" ADD COLUMN     "closingTime" TEXT NOT NULL DEFAULT '16:00',
ADD COLUMN     "openingTime" TEXT NOT NULL DEFAULT '09:00';
