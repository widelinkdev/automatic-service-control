import forge from "node-forge";

export function encryptRSA(plaintext: string, nn: string, ee: string): string {
  // Convert the hexadecimal string nn (modulus) and ee (public exponent) to BigInteger
  const n = new forge.jsbn.BigInteger(nn, 16); // Hexadecimal string to BigInteger
  const e = new forge.jsbn.BigInteger(ee, 16); // Hexadecimal string to BigInteger

  // Create the public key using the modulus and exponent
  const publicKey = forge.pki.setRsaPublicKey(n, e);

  // Encrypt the plaintext using the RSA public key
  const encrypted = publicKey.encrypt(plaintext);

  // Convert the encrypted byte array to a hexadecimal string
  const encryptedHex = forge.util.bytesToHex(encrypted);

  return encryptedHex;
}
