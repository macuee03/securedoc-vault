import { HardDrive, Lock, Fingerprint } from "lucide-react";

export default function StatsOverview({ totalFiles }: { totalFiles: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-[#0e112a]/80 border border-purple-500/15 p-5 rounded-2xl flex items-center gap-4">
        <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400">
          <HardDrive className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-slate-400">Total Berkas Diamankan</div>
          <div className="text-2xl font-bold text-white">{totalFiles} File</div>
        </div>
      </div>

      <div className="bg-[#0e112a]/80 border border-purple-500/15 p-5 rounded-2xl flex items-center gap-4">
        <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-slate-400">Standar Algoritma</div>
          <div className="text-base font-bold text-white">AES-256-GCM + IV</div>
        </div>
      </div>

      <div className="bg-[#0e112a]/80 border border-purple-500/15 p-5 rounded-2xl flex items-center gap-4">
        <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
          <Fingerprint className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-slate-400">Integritas Checksum</div>
          <div className="text-base font-bold text-white">
            SHA-256 Anti-Tamper
          </div>
        </div>
      </div>
    </div>
  );
}
