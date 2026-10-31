"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Trash2,
  Fingerprint,
  RefreshCw,
  Lock,
  Share2,
  History,
} from "lucide-react";
import { DocumentItem } from "@/types/document";
import ShareModal from "./ShareModal";
import AuditLogModal from "./AuditLogModal";

interface DocumentListProps {
  documents: DocumentItem[];
  loading: boolean;
  onRefresh: () => void;
  onDelete: (id: string, title: string) => void;
}

export default function DocumentList({
  documents,
  loading,
  onRefresh,
  onDelete,
}: DocumentListProps) {
  const [sharingDoc, setSharingDoc] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [auditDoc, setAuditDoc] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      <div className="bg-[#0e112a]/90 border border-teal-500/20 rounded-3xl p-4 sm:p-6 md:p-8 backdrop-blur-xl shadow-[0_18px_50px_rgba(3,5,20,0.2)]">
        <div className="flex items-start gap-3 justify-between mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-[0.18em] text-teal-300/70">
                Koleksi Anda
              </span>
              <span className="h-px w-8 bg-teal-500/40" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-start gap-2">
              <FileText className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />{" "}
              <span>Dokumen Tersimpan</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Dokumen disimpan dalam bentuk terenkripsi dan dapat diunduh kapan
              saja.
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl bg-[#141842] border border-teal-500/30 text-teal-300 hover:text-white transition-all cursor-pointer shrink-0"
            title="Segarkan data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-teal-400" />
            <span>Memuat dokumen...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
            <Lock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-medium">
              Belum ada dokumen
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Unggah dokumen pertama Anda untuk mulai menggunakan penyimpanan
              aman.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-[#070b16] border border-slate-800/90 hover:border-teal-500/40 p-3.5 sm:p-4 rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-white group-hover:text-teal-300 transition-colors break-words">
                      {doc.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                      <span>{doc.originalName}</span>
                      <span>•</span>
                      <span>{formatBytes(doc.fileSize)}</span>
                      <span>•</span>
                      <span className="text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/50">
                        AES-GCM
                      </span>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Fingerprint className="w-3 h-3 text-teal-400" />
                      <span>
                        SHA-256: {doc.fileHash.slice(0, 16)}...
                        {doc.fileHash.slice(-8)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tindakan dokumen */}
                <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
                  <button
                    onClick={() =>
                      setAuditDoc({ id: doc.id, title: doc.title })
                    }
                    className="p-2 rounded-xl bg-[#141842] border border-teal-500/30 text-teal-300 hover:text-white transition-all cursor-pointer"
                    title="Lihat riwayat akses"
                  >
                    <History className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() =>
                      setSharingDoc({ id: doc.id, title: doc.title })
                    }
                    className="flex-1 md:flex-none justify-center px-3 py-2 rounded-xl bg-[#141842] border border-teal-500/30 text-teal-300 hover:text-white hover:border-teal-400 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                    title="Bagikan dengan batas akses dan PIN"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Bagikan
                  </button>

                  <a
                    href={`/api/documents/${doc.id}/download`}
                    download
                    className="flex-1 md:flex-none justify-center px-3.5 py-2 rounded-xl bg-linear-to-r from-teal-500 to-sky-600 text-slate-950 font-medium text-xs hover:shadow-[0_0_15px_rgba(45,212,191,0.35)] transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Dekripsi dan unduh dokumen"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh
                  </a>

                  <button
                    onClick={() => onDelete(doc.id, doc.title)}
                    className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/60 transition-all cursor-pointer"
                    title="Hapus dokumen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {sharingDoc && (
        <ShareModal
          documentId={sharingDoc.id}
          documentTitle={sharingDoc.title}
          onClose={() => setSharingDoc(null)}
        />
      )}

      {auditDoc && (
        <AuditLogModal
          documentId={auditDoc.id}
          documentTitle={auditDoc.title}
          onClose={() => setAuditDoc(null)}
        />
      )}
    </>
  );
}
