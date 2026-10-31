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
        text: "Pilih dokumen yang ingin diunggah.",
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
          text: "Dokumen berhasil dienkripsi dan disimpan.",
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
          text:           res.error || "Dokumen tidak dapat diunggah.",
        });
      }
    });
  };

  return (
    <div className="relative overflow-hidden bg-linear-to-br from-[#102d35] via-[#0e112a]/95 to-[#0e112a]/90 border border-teal-400/25 rounded-3xl p-5 sm:p-6 md:p-8 backdrop-blur-xl shadow-[0_18px_50px_rgba(3,5,20,0.25)]">
      <div className="absolute -top-20 -right-16 w-48 h-48 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-start gap-3 mb-1">
          <div className="p-2 rounded-xl bg-teal-500/15 border border-teal-400/25 text-teal-300">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-teal-300/70 mb-0.5">
              Ruang kerja
            </p>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Unggah Dokumen
            </h2>
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-6 sm:ml-12">
          Dokumen akan dienkripsi sebelum disimpan. Ukuran maksimal 5 MB.
        </p>

      <form onSubmit={handleUpload} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Judul Dokumen
            </label>
            <input
              type="text"
              placeholder="Contoh: Kontrak kerja 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#141842]/70 border border-teal-500/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Pilih Dokumen (PDF, JPG, PNG - maksimal 5 MB)
            </label>
            <input
              id="file-input"
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-950 file:text-teal-300 hover:file:bg-teal-900 cursor-pointer bg-[#141842]/70 border border-teal-500/30 rounded-xl p-1.5"
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
          className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-linear-to-r from-teal-500 to-sky-600 text-slate-950 font-semibold text-xs shadow-[0_0_20px_rgba(45,212,191,0.25)] hover:shadow-[0_0_30px_rgba(45,212,191,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Mengenkripsi
              dokumen...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" /> Enkripsi dan Simpan
            </>
          )}
        </button>
      </form>
      </div>
    </div>
  );
}
