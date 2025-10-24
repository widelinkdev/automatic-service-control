import forge from "node-forge";
export function encryptRSA(plaintext, nn, ee) {
    const n = new forge.jsbn.BigInteger(nn, 16);
    const e = new forge.jsbn.BigInteger(ee, 16);
    const publicKey = forge.pki.setRsaPublicKey(n, e);
    const encrypted = publicKey.encrypt(plaintext);
    const encryptedHex = forge.util.bytesToHex(encrypted);
    return encryptedHex;
}
//# sourceMappingURL=rsa.js.map