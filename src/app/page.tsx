"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, LoaderCircle, Trash2, X } from "lucide-react";
import Header from "@/components/dashboard/Header";
import StatsOverview from "@/components/dashboard/StatsOverview";
import UploadCard from "@/components/dashboard/UploadCard";
import DocumentList from "@/components/dashboard/DocumentList";
import { getDocuments, deleteDocument } from "./actions/document";
import { DocumentItem } from "@/types/document";

export default function Dashboard() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentToDelete, setDocumentToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fungsi refresh manual (hanya ini yang mereset loading ke true)
  const refreshDocs = async () => {
    setLoading(true);
    const res = await getDocuments();
    if (res.success && res.data) {
      setDocuments(res.data as DocumentItem[]);
    }
    setLoading(false);
  };

  // Mengambil data awal saat halaman pertama kali dibuka (Aman dari peringatan React 19)
  useEffect(() => {
    let isMounted = true;

    getDocuments().then((res) => {
      if (isMounted) {
        if (res.success && res.data) {
          setDocuments(res.data as DocumentItem[]);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = (id: string, docTitle: string) => {
    setDocumentToDelete({ id, title: docTitle });
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    setDeleting(true);
    const result = await deleteDocument(documentToDelete.id);
    if (result.success) {
      setDocumentToDelete(null);
      await refreshDocs();
    } else {
      setDeleteError(result.error || "Dokumen tidak dapat dihapus.");
    }
    setDeleting(false);
  };

  return (
    <div className="min-h-screen bg-[#070817] text-slate-100 font-sans selection:bg-teal-500 selection:text-white px-3 py-4 sm:p-6 md:p-10 relative overflow-x-hidden">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/4 w-120 h-120 bg-teal-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-120 h-120 bg-sky-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6 md:space-y-8 relative z-10">
        <Header />
        <StatsOverview totalFiles={documents.length} />
        <UploadCard onUploadSuccess={refreshDocs} />
        <DocumentList
          documents={documents}
          loading={loading}
          onRefresh={refreshDocs}
          onDelete={handleDelete}
        />
      </div>

      {documentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="w-full max-w-md rounded-3xl border border-rose-500/25 bg-[#0e112a] p-5 sm:p-6 shadow-[0_0_50px_rgba(15,23,42,0.6)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/50 p-2.5 text-rose-300">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2
                    id="delete-dialog-title"
                    className="text-base font-semibold text-white"
                  >
                    Hapus dokumen?
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    Dokumen ini akan dihapus secara permanen dan tidak dapat
                    dipulihkan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDocumentToDelete(null)}
                disabled={deleting}
                aria-label="Tutup dialog"
                className="cursor-pointer rounded-lg p-1 text-slate-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-slate-700/80 bg-slate-950/40 px-3.5 py-3">
              <p className="truncate text-sm font-medium text-slate-200">
                {documentToDelete.title}
              </p>
            </div>

            {deleteError && (
              <p className="mt-3 rounded-xl border border-rose-500/30 bg-rose-950/40 px-3.5 py-2.5 text-xs text-rose-300">
                {deleteError}
              </p>
            )}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDocumentToDelete(null)}
                disabled={deleting}
                className="cursor-pointer rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Hapus Permanen
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
