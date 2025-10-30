-- AlterTable
ALTER TABLE "public"."PaymentTaskLog" ADD COLUMN     "retries" INTEGER NOT NULL DEFAULT 0;
