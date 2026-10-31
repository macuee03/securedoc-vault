"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Clock,
  Globe,
  X,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getDocumentAuditLogs } from "@/app/actions/document";

interface AuditLogItem {
  id: string;
  action: string;
  status: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

interface AuditLogModalProps {
  documentId: string;
  documentTitle: string;
  onClose: () => void;
}

export default function AuditLogModal({
  documentId,
  documentTitle,
  onClose,
}: AuditLogModalProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const res = await getDocumentAuditLogs(documentId);
      if (res.success && res.data) {
        setLogs(res.data as AuditLogItem[]);
      }
      setLoading(false);
    }
    fetchLogs();
  }, [documentId]);

  const formatAction = (action: string) => {
    switch (action) {
      case "UPLOAD":
        return "Dokumen Diunggah & Dienkripsi";
      case "DOWNLOAD_OWNER":
        return "Diunduh oleh Pemilik";
      case "CREATE_SHARE_LINK":
        return "Tautan Berbagi Dibuat";
      case "SHARE_DOWNLOAD":
        return "Diunduh via Tautan Publik";
      case "FAILED_PIN":
        return "Percobaan PIN Salah Ditolak";
      default:
        return action;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-[#0e112a] border border-purple-500/30 rounded-3xl p-6 md:p-8 max-w-lg w-full relative shadow-[0_0_50px_rgba(168,85,247,0.2)] flex flex-col max-h-[85vh]">
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 shrink-0">
          <div className="p-2.5 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Jejak Audit Keamanan
            </h3>
            <p className="text-xs text-slate-400 truncate max-w-xs">
              {documentTitle}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center gap-2 text-xs text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
            <span>Memuat jejak audit...</span>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">
            Belum ada riwayat aktivitas pada berkas ini.
          </p>
        ) : (
          <div className="overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-[#141842]/60 border border-purple-500/15 rounded-2xl p-3.5 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    {log.status === "SUCCESS" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-200">
                      {formatAction(log.action)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-400" />
                      {new Date(log.createdAt).toLocaleString("id-ID")}
                    </span>
                    {log.ipAddress && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-cyan-400" />
                          IP: {log.ipAddress}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                    log.status === "SUCCESS"
                      ? "bg-emerald-950/70 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-950/70 border-rose-500/30 text-rose-300"
                  }`}
                >
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-all cursor-pointer mt-5 shrink-0"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
