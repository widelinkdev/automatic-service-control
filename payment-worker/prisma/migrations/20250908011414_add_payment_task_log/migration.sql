-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('PENDING', 'SUCCESS', 'SKIPPED', 'FAILED');

-- CreateTable
CREATE TABLE "public"."PaymentEvent" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."WebhookStatus" NOT NULL DEFAULT 'WAITING',

    CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentTaskLog" (
    "id" TEXT NOT NULL,
    "paymentEventId" INTEGER NOT NULL,
    "status" "public"."TaskStatus" NOT NULL,
    "message" TEXT,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentTaskLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."PaymentTaskLog" ADD CONSTRAINT "PaymentTaskLog_paymentEventId_fkey" FOREIGN KEY ("paymentEventId") REFERENCES "public"."PaymentEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
