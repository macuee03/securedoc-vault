"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/Header";
import StatsOverview from "@/components/dashboard/StatsOverview";
import UploadCard from "@/components/dashboard/UploadCard";
import DocumentList from "@/components/dashboard/DocumentList";
import { getDocuments, deleteDocument } from "./actions/document";
import { DocumentItem } from "@/types/document";

export default function Dashboard() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id: string, docTitle: string) => {
    if (confirm(`Hapus permanen dokumen "${docTitle}" dari brankas?`)) {
      await deleteDocument(id);
      await refreshDocs();
    }
  };

  return (
    <div className="min-h-screen bg-[#070817] text-slate-100 font-sans selection:bg-purple-500 selection:text-white p-4 md:p-10 relative overflow-x-hidden">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/4 w-120 h-120 bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-120 h-120 bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
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
    </div>
  );
}
