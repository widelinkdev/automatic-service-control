import crypto from "crypto";

const ALGO = "aes-256-gcm";
const KEY = Buffer.from(process.env.OLT_ENCRYPTION_KEY || "", "hex");
const IV_LEN = 12;

if (KEY.length !== 32) {
  throw new Error("MASTER_KEY must be a 32-byte hex string (64 hex chars)");
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decrypt(base64: string): string {
  const data = Buffer.from(base64, "base64");
  const iv = data.subarray(0, IV_LEN);
  const tag = data.subarray(IV_LEN, IV_LEN + 16);
  const ciphertext = data.subarray(IV_LEN + 16);
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}

// Generate OLT_ENCRYPTION_KEY
// node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"