"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { encryptBuffer } from "@/lib/crypto";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Helper: Memastikan ada akun Demo agar foreign key userId selalu valid
async function getOrCreateDemoUser() {
  let user = await prisma.user.findFirst({
    where: { email: "malik@securedoc.vault" },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "malik@securedoc.vault",
        name: "Malik Maulana",
        password: "hasheddemopassword",
      },
    });
  }
  return user;
}

// 1. Action: Upload & Enkripsi Dokumen
export async function uploadDocument(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "Dokumen tanpa judul";

    if (!file || file.size === 0) {
      return { success: false, error: "Pilih dokumen terlebih dahulu." };
    }

    // Batas file 5MB untuk database tier gratis
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "Ukuran dokumen maksimal 5 MB." };
    }

    // Ubah file menjadi Buffer Node.js
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ENKRIPSI DENGAN AES-256-GCM + CHECKSUkM SHA-256
    const { encryptedData, iv, authTag, fileHash } = encryptBuffer(buffer);

    const user = await getOrCreateDemoUser();

    // Simpan ke PostgreSQL Neon
    const document = await prisma.document.create({
      data: {
        title,
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        encryptedData,
        iv,
        authTag,
        fileHash,
        userId: user.id,
      },
    });

    // Catat ke Audit Log
    await prisma.auditLog.create({
      data: {
        action: "UPLOAD",
        status: "SUCCESS",
        documentId: document.id,
        userAgent: "Server Action / Dashboard",
      },
    });

    revalidatePath("/");
    return { success: true, documentId: document.id };
  } catch (error: unknown) {
    console.error("Gagal mengunggah dokumen:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengenkripsi dokumen.",
    };
  }
}

// 2. Action: Ambil Seluruh Daftar Dokumen
export async function getDocuments() {
  try {
    const user = await getOrCreateDemoUser();
    const documents = await prisma.document.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        shareLinks: {
          select: {
            id: true,
            slug: true,
            isActive: true,
            currentViews: true,
            maxViews: true,
          },
        },
      },
    });
    return { success: true, data: documents };
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    return { success: false, data: [] };
  }
}

// 3. Action: Hapus Dokumen
export async function deleteDocument(documentId: string) {
  try {
    await prisma.document.delete({
      where: { id: documentId },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus dokumen:", error);
    return { success: false, error: "Dokumen tidak dapat dihapus." };
  }
}

// 4. Action: Membuat Link Berbagi Aman (Dengan PIN & Self-Destruct)
export async function createShareLink(
  documentId: string,
  options: {
    pin?: string;
    maxViews?: number;
    expireHours?: number;
  },
) {
  try {
    let pinHash: string | undefined = undefined;
    if (options.pin && options.pin.trim() !== "") {
      pinHash = await bcrypt.hash(options.pin, 10);
    }

    let expiresAt: Date | undefined = undefined;
    if (options.expireHours && options.expireHours > 0) {
      expiresAt = new Date(Date.now() + options.expireHours * 60 * 60 * 1000);
    }

    // Buat slug acak yang aman (contoh: 8 karakter acak)
    const slug = crypto.randomBytes(6).toString("hex");

    const link = await prisma.shareLink.create({
      data: {
        documentId,
        slug,
        pinHash,
        maxViews: options.maxViews ? Number(options.maxViews) : null,
        expiresAt,
        isActive: true,
      },
    });

    // Catat ke Audit Log
    await prisma.auditLog.create({
      data: {
        action: "CREATE_SHARE_LINK",
        status: "SUCCESS",
        documentId,
        shareLinkId: link.id,
      },
    });

    revalidatePath("/");
    return { success: true, slug: link.slug };
  } catch (error) {
    console.error("Gagal membuat link berbagi:", error);
    return { success: false, error: "Tautan berbagi tidak dapat dibuat." };
  }
}

// 5. Action: Mengambil Jejak Audit Log per Dokumen
export async function getDocumentAuditLogs(documentId: string) {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { documentId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: logs };
  } catch (error) {
    console.error("Gagal mengambil audit log:", error);
    return { success: false, data: [] };
  }
}
