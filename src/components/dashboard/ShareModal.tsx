"use client";

import { useState, useTransition } from "react";
import {
  Lock,
  Clock,
  Eye,
  Share2,
  Copy,
  Check,
  X,
  ShieldAlert,
} from "lucide-react";
import { createShareLink } from "@/app/actions/document";

interface ShareModalProps {
  documentId: string;
  documentTitle: string;
  onClose: () => void;
}

export default function ShareModal({
  documentId,
  documentTitle,
  onClose,
}: ShareModalProps) {
  const [pin, setPin] = useState("");
  const [maxViews, setMaxViews] = useState("1"); // Default: View-once (1x buka)
  const [expireHours, setExpireHours] = useState("24"); // Default: 24 jam
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createShareLink(documentId, {
        pin: pin || undefined,
        maxViews: maxViews ? parseInt(maxViews) : undefined,
        expireHours: expireHours ? parseInt(expireHours) : undefined,
      });

      if (res.success && res.slug) {
        const fullUrl = `${window.location.origin}/share/${res.slug}`;
        setGeneratedUrl(fullUrl);
      }
    });
  };

  const handleCopy = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-[#0e112a] border border-purple-500/30 rounded-3xl p-6 md:p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(168,85,247,0.2)]">
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Bagikan Berkas Aman
            </h3>
            <p className="text-xs text-slate-400 truncate max-w-xs">
              {documentTitle}
            </p>
          </div>
        </div>

        {generatedUrl ? (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Link berhasil dibuat dengan kebijakan keamanan aktif!</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Tautan Publik:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedUrl}
                  className="w-full bg-[#141842] border border-purple-500/30 rounded-xl px-3.5 py-2 text-xs font-mono text-purple-300 select-all"
                />
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? "Disalin" : "Salin"}
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-all cursor-pointer mt-2"
            >
              Selesai & Tutup
            </button>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-purple-400" /> Kunci dengan
                PIN / Password (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: 123456 atau rahasia123"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-[#141842]/70 border border-purple-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" /> Batas Maks Buka
                </label>
                <select
                  value={maxViews}
                  onChange={(e) => setMaxViews(e.target.value)}
                  className="w-full bg-[#141842]/70 border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="1">1x Buka (View-Once)</option>
                  <option value="3">Maksimal 3x Buka</option>
                  <option value="5">Maksimal 5x Buka</option>
                  <option value="">Tanpa Batas Unduh</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Masa Berlaku
                </label>
                <select
                  value={expireHours}
                  onChange={(e) => setExpireHours(e.target.value)}
                  className="w-full bg-[#141842]/70 border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="1">1 Jam</option>
                  <option value="24">24 Jam (1 Hari)</option>
                  <option value="72">3 Hari</option>
                  <option value="168">7 Hari</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              <Share2 className="w-4 h-4" />{" "}
              {isPending ? "Membuat Tautan Aman..." : "Buat Tautan Rahasia"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
