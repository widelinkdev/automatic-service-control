import "dotenv/config";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { encrypt } from "./olt_crypto.js";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, "../../", "olts.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

async function main() {
  console.log("🚀 Starting OLT devices seeding...");

  for (const d of data) {
    const passwordEncrypted = encrypt(d.password);

    await prisma.OLTDevice.upsert({
      where: { ip: d.ip },
      update: {
        name: d.name,
        type: d.type,
        location: d.location,
        username: d.username,
        password_encrypted: passwordEncrypted,
        notes: d.notes,
      },
      create: {
        name: d.name,
        type: d.type,
        location: d.location,
        ip: d.ip,
        username: d.username,
        password_encrypted: passwordEncrypted,
        notes: d.notes,
      },
    });

    console.log(`✅ OLT ${d.name} (${d.ip}) registrada.`);
  }

  console.log("🎉 OLT data inserted successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error inserting OLT data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
