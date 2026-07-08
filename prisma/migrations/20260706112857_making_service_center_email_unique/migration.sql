/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `ServiceCenter` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ServiceCenter_email_key" ON "ServiceCenter"("email");
