import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptBuffer, verifyIntegrity } from "@/lib/crypto";
import bcrypt from "bcryptjs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const body = await request.json().catch(() => ({}));
    const pin = body.pin as string | undefined;

    // 1. Cari ShareLink dan Dokumen terkait
    const shareLink = await prisma.shareLink.findUnique({
      where: { slug },
      include: { document: true },
    });

    if (!shareLink || !shareLink.isActive) {
      return NextResponse.json(
        { error: "Tautan tidak valid atau telah dinonaktifkan." },
        { status: 404 },
      );
    }

    // 2. Cek Masa Berlaku (Expired)
    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      await prisma.shareLink.update({
        where: { id: shareLink.id },
        data: { isActive: false },
      });
      return NextResponse.json(
        { error: "Tautan ini telah kadaluarsa." },
        { status: 410 },
      );
    }

    // 3. Cek Batas Maksimal Dibuka (Self-Destruct / View-Once)
    if (shareLink.maxViews && shareLink.currentViews >= shareLink.maxViews) {
      await prisma.shareLink.update({
        where: { id: shareLink.id },
        data: { isActive: false },
      });
      return NextResponse.json(
        { error: "Batas akses tautan ini telah habis (Self-Destructed)." },
        { status: 410 },
      );
    }

    // 4. Validasi PIN (Jika link dilindungi PIN)
    if (shareLink.pinHash) {
      if (!pin) {
        return NextResponse.json(
          {
            error: "PIN keamanan diperlukan untuk membuka berkas ini.",
            needPin: true,
          },
          { status: 401 },
        );
      }
      const isPinValid = await bcrypt.compare(pin, shareLink.pinHash);
      if (!isPinValid) {
        // Catat kegagalan PIN ke Audit Log
        await prisma.auditLog.create({
          data: {
            action: "FAILED_PIN",
            status: "DENIED",
            documentId: shareLink.documentId,
            shareLinkId: shareLink.id,
            userAgent: request.headers.get("user-agent") || "Unknown",
            ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
          },
        });
        return NextResponse.json(
          { error: "PIN yang kamu masukkan salah!", needPin: true },
          { status: 401 },
        );
      }
    }

    // 5. Tambah jumlah hitungan view & cek apakah harus dinonaktifkan
    const nextViews = shareLink.currentViews + 1;
    const shouldDeactivate = shareLink.maxViews
      ? nextViews >= shareLink.maxViews
      : false;

    await prisma.shareLink.update({
      where: { id: shareLink.id },
      data: {
        currentViews: nextViews,
        isActive: !shouldDeactivate,
      },
    });

    // 6. Dekripsi Dokumen di Server (AES-256-GCM)
    const doc = shareLink.document;
    const decryptedBuffer = decryptBuffer(
      doc.encryptedData,
      doc.iv,
      doc.authTag,
    );

    // 7. Verifikasi Integritas File (SHA-256)
    const isTamperFree = verifyIntegrity(decryptedBuffer, doc.fileHash);
    if (!isTamperFree) {
      return NextResponse.json(
        { error: "Peringatan Integritas: Berkas termanipulasi!" },
        { status: 400 },
      );
    }

    // 8. Catat Audit Log Keberhasilan Akses
    await prisma.auditLog.create({
      data: {
        action: "SHARE_DOWNLOAD",
        status: "SUCCESS",
        documentId: doc.id,
        shareLinkId: shareLink.id,
        userAgent: request.headers.get("user-agent") || "Unknown",
        ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    });

    // 9. Kirim File Asli ke Penerima
    return new NextResponse(new Uint8Array(decryptedBuffer), {
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.originalName)}"`,
        "Content-Length": decryptedBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Gagal memproses share download:", error);
    return NextResponse.json(
      { error: "Gagal mendekripsi dokumen." },
      { status: 500 },
    );
  }
}
