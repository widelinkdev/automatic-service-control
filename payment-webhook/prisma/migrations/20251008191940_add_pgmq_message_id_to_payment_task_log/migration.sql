/*
  Warnings:

  - Added the required column `pgmqMessageId` to the `PaymentTaskLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."PaymentTaskLog" ADD COLUMN     "pgmqMessageId" TEXT NOT NULL;
