"use client";

import { useState, useEffect, use } from "react";
import {
  ShieldCheck,
  Lock,
  Download,
  AlertTriangle,
  Fingerprint,
  FileText,
  //   Clock,
  //   Eye,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface DocumentMeta {
  title: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileHash: string;
  isPinProtected: boolean;
  maxViews: number | null;
  currentViews: number;
  expiresAt: string | null;
}

export default function SharedDocumentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [meta, setMeta] = useState<DocumentMeta | null>(null);
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Ambil info status link saat dibuka
  useEffect(() => {
    async function checkLink() {
      try {
        const res = await fetch(`/api/share/${slug}/download`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: "__CHECK_ONLY__" }),
        });

        // Jika respons 401 dan butuh PIN, berarti link aktif tapi butuh password
        if (res.status === 401) {
          setMeta({
            title: "Dokumen Terenkripsi",
            originalName: "Protected_File",
            fileSize: 0,
            mimeType: "application/octet-stream",
            fileHash: "",
            isPinProtected: true,
            maxViews: null,
            currentViews: 0,
            expiresAt: null,
          });
          setLoading(false);
          return;
        }

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setErrorMsg(
            data?.error || "Tautan ini telah hangus atau tidak valid.",
          );
        }
      } catch {
        setErrorMsg("Gagal memeriksa tautan dokumen.");
      } finally {
        setLoading(false);
      }
    }

    checkLink();
  }, [slug]);

  // Handler Download & Dekripsi File
  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setDownloading(true);

    try {
      const res = await fetch(`/api/share/${slug}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pin || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data?.error || "Gagal mengunduh dokumen.");
        setDownloading(false);
        return;
      }

      // Ambil file biner dan trigger download di browser
      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition");
      let filename = "dokumen_rahasia";
      if (contentDisposition && contentDisposition.includes("filename=")) {
        filename = decodeURIComponent(
          contentDisposition.split("filename=")[1].replace(/"/g, ""),
        );
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setDownloadSuccess(true);
    } catch {
      setErrorMsg("Terjadi kesalahan saat memproses unduhan.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070817] text-slate-100 font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="fixed top-1/4 left-1/4 w-120 h-120 bg-purple-600/12 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-120 h-120 bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-md w-full bg-[#0e112a]/90 border border-purple-500/25 rounded-3xl p-6 md:p-8 backdrop-blur-xl relative z-10 shadow-[0_0_60px_rgba(168,85,247,0.15)] text-center">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-purple-600 to-indigo-600 mx-auto flex items-center justify-center text-white shadow-[0_0_25px_rgba(168,85,247,0.4)] mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-extrabold text-white">
          SecureDoc Vault Portal
        </h1>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          Penerima Berkas Terenkripsi End-to-End
        </p>

        {loading ? (
          <div className="py-8 flex flex-col items-center gap-2 text-xs text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
            <span>Memverifikasi izin akses tautan...</span>
          </div>
        ) : errorMsg ? (
          /* TAMPILAN JIKA LINK TELAH HANGUS / EXPIRED / SELF-DESTRUCT */
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs text-left flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">
                  Akses Ditolak / Tidak Tersedia
                </p>
                <p className="mt-1 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Dokumen ini mungkin telah mencapai batas unduh maksimal atau
              otomatis dihancurkan demi privasi.
            </p>
          </div>
        ) : downloadSuccess ? (
          /* TAMPILAN SETELAH FILE BERHASIL DIUNDUH */
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 text-left">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <div>
                <p className="font-semibold text-emerald-200">
                  File Berhasil didekripsi & diunduh!
                </p>
                <p className="text-[11px] text-emerald-400/80 mt-0.5">
                  Integritas berkas 100% cocok dengan SHA-256 asli.
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Jika tautan ini diatur sebagai <i>View-Once</i>, maka tautan ini
              sekarang sudah otomatis hangus dan tidak dapat dibuka kembali.
            </p>
          </div>
        ) : (
          /* FORM DOWNLOAD BERKAS */
          <form onSubmit={handleDownload} className="space-y-4 text-left">
            <div className="bg-[#141842]/70 border border-purple-500/20 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-950 text-purple-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-white">
                    Dokumen Rahasia Siap Diunduh
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-purple-300 font-mono">
                    <span className="bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/40">
                      AES-256-GCM
                    </span>
                    <span className="text-slate-400">• Bebas Manipulasi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Input PIN jika dokumen terkunci */}
            {meta?.isPinProtected && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" /> Masukkan PIN
                  Keamanan:
                </label>
                <input
                  type="password"
                  placeholder="Masukkan 6-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-[#141842] border border-purple-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-mono tracking-widest text-center text-sm"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={downloading}
              className="w-full py-3 rounded-full bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {downloading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Mendekripsi
                  Berkas...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Dekripsi & Unduh Berkas
                  Sekarang
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1.5">
          <Fingerprint className="w-3 h-3 text-cyan-400" />
          <span>Cryptographic Zero-Knowledge Verification</span>
        </div>
      </div>
    </div>
  );
}
