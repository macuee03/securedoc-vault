import { HardDrive, Lock, Fingerprint } from "lucide-react";

export default function StatsOverview({ totalFiles }: { totalFiles: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      <div className="bg-linear-to-br from-teal-950/45 to-[#0e112a]/90 border border-teal-500/25 p-5 rounded-2xl flex items-center gap-4 shadow-[0_12px_30px_rgba(3,5,20,0.2)] transition-colors hover:border-teal-400/40">
        <div className="p-3 rounded-xl bg-teal-950/80 border border-teal-400/30 text-teal-300">
          <HardDrive className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-slate-400">Total Dokumen</div>
          <div className="text-2xl font-bold text-white">
            {totalFiles} Dokumen
          </div>
        </div>
      </div>

      <div className="bg-[#0e112a]/80 border border-sky-500/15 p-5 rounded-2xl flex items-center gap-4 transition-colors hover:border-sky-400/35">
        <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-500/30 text-sky-400">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-slate-400">Enkripsi</div>
          <div className="text-base font-bold text-white">AES-256-GCM</div>
        </div>
      </div>

      <div className="bg-[#0e112a]/80 border border-slate-500/20 p-5 rounded-2xl flex items-center gap-4 transition-colors hover:border-teal-400/35">
        <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-400">
          <Fingerprint className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-slate-400">Verifikasi Integritas</div>
          <div className="text-base font-bold text-white">
            SHA-256
          </div>
        </div>
      </div>
    </div>
  );
}
