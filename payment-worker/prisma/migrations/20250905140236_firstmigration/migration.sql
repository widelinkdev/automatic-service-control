-- CreateEnum
CREATE TYPE "public"."WebhookStatus" AS ENUM ('WAITING', 'PROCESSING', 'PROCESSED', 'FAILED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."WebhookEvent" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."WebhookStatus" NOT NULL DEFAULT 'WAITING',

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);
