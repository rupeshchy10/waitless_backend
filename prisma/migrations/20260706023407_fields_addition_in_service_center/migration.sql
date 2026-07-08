/*
  Warnings:

  - Added the required column `email` to the `ServiceCenter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `ServiceCenter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ServiceCenter" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT NOT NULL;
