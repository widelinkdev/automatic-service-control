import { PrismaClient } from "@prisma/client";
import { decrypt } from "./olt_crypto.js";

const prisma = new PrismaClient();

export async function getOltByIp(ip: string) {
  const olt = await prisma.OLTDevice.findUnique({
    where: { ip },
  });

  if (!olt) {
    console.warn(`[OLT] No device found with IP ${ip}`);
    return null;
  }

  const password = decrypt(olt.password_encrypted);

  return {
    ...olt,
    password,
  };
}
