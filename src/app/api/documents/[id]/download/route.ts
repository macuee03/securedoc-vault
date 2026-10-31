import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptBuffer, verifyIntegrity } from "@/lib/crypto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const doc = await prisma.document.findUnique({
      where: { id },
    });

    if (!doc) {
      return new NextResponse("Dokumen tidak ditemukan", { status: 404 });
    }

    // 1. DEKRIPSI FILE DENGAN AES-256-GCM
    const decryptedBuffer = decryptBuffer(
      doc.encryptedData,
      doc.iv,
      doc.authTag,
    );

    // 2. VERIFIKASI KEASLIAN INTEGRITAS DATA (SHA-256)
    const isTamperFree = verifyIntegrity(decryptedBuffer, doc.fileHash);
    if (!isTamperFree) {
      return new NextResponse(
        "Peringatan Keamanan: Integritas data rusak/termanipulasi!",
        { status: 400 },
      );
    }

    // 3. Catat ke Audit Log
    await prisma.auditLog.create({
      data: {
        action: "DOWNLOAD_OWNER",
        status: "SUCCESS",
        documentId: doc.id,
        userAgent: request.headers.get("user-agent") || "Unknown",
        ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    });

    // 4. Kirim file asli kembali ke browser
    return new NextResponse(new Uint8Array(decryptedBuffer), {
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.originalName)}"`,
        "Content-Length": decryptedBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Gagal mendekripsi file:", error);
    return new NextResponse("Gagal memproses dekripsi file.", { status: 500 });
  }
}
