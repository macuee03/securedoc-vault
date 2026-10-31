import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128-bit IV

// Ambil secret key dari .env (wajib 32 bytes)
function getMasterKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET_KEY;
  if (!secret) {
    throw new Error("ENCRYPTION_SECRET_KEY belum diatur di .env");
  }
  // Buat hash SHA-256 dari secret key agar panjangnya pasti 32 bytes
  return crypto.createHash("sha256").update(String(secret)).digest();
}

/**
 * 1. Enkripsi File menggunakan AES-256-GCM
 * Sekaligus menghitung SHA-256 Checksum dari file asli untuk validasi integritas
 */
export function encryptBuffer(buffer: Buffer) {
  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  // Buat cipher AES-256-GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Enkripsi data
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

  // Ambil authTag (GCM mode menghasilkan tag untuk deteksi manipulasi data)
  const authTag = cipher.getAuthTag();

  // Hitung SHA-256 hash dari file asli sebelum dienkripsi
  const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");

  return {
    encryptedData: encrypted.toString("base64"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    fileHash,
  };
}

/**
 * 2. Dekripsi File kembali ke Buffer asli
 */
export function decryptBuffer(
  encryptedBase64: string,
  ivHex: string,
  authTagHex: string,
): Buffer {
  const key = getMasterKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedBase64, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted;
}

/**
 * 3. Verifikasi Keaslian File (Integrity Check)
 */
export function verifyIntegrity(buffer: Buffer, originalHash: string): boolean {
  const currentHash = crypto.createHash("sha256").update(buffer).digest("hex");
  return currentHash === originalHash;
}
