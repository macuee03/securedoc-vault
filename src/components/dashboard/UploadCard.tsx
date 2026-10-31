"use client";

import { useState, useTransition } from "react";
import {
  UploadCloud,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { uploadDocument } from "@/app/actions/document";

export default function UploadCard({
  onUploadSuccess,
}: {
  onUploadSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setStatusMessage({
        type: "error",
        text: "Pilih berkas yang ingin diamankan!",
      });
      return;
    }

    setStatusMessage(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("title", title || selectedFile.name);
      formData.append("file", selectedFile);

      const res = await uploadDocument(formData);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: "Berkas berhasil dienkripsi dengan AES-256-GCM dan disimpan!",
        });
        setTitle("");
        setSelectedFile(null);
        const fileInput = document.getElementById(
          "file-input",
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        onUploadSuccess();
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Gagal mengunggah berkas",
        });
      }
    });
  };

  return (
    <div className="bg-[#0e112a]/90 border border-purple-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
      <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
        <UploadCloud className="w-5 h-5 text-purple-400" /> Amankan & Enkripsi
        Dokumen Baru
      </h2>
      <p className="text-xs text-slate-400 mb-6">
        Berkas akan langsung diacak di server menggunakan enkripsi terotentikasi
        sebelum disimpan ke Neon.
      </p>

      <form onSubmit={handleUpload} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Label / Judul Dokumen
            </label>
            <input
              type="text"
              placeholder="Contoh: Dokumen KTP, Rekam Medis, Kontrak Kerja"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#141842]/70 border border-purple-500/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Pilih Berkas (PDF, JPG, PNG - Maks 5 MB)
            </label>
            <input
              id="file-input"
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-950 file:text-purple-300 hover:file:bg-purple-900 cursor-pointer bg-[#141842]/70 border border-purple-500/30 rounded-xl p-1.5"
            />
          </div>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
              statusMessage.type === "success"
                ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300"
                : "bg-rose-950/60 border border-rose-500/40 text-rose-300"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-full bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Sedang Mengenkripsi
              Berkas...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" /> Enkripsi & Simpan Dokumen
            </>
          )}
        </button>
      </form>
    </div>
  );
}
