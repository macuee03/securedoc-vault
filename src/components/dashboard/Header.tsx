import { ShieldCheck } from "lucide-react";

export default function Header() {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-500/15 pb-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-linear-to-tr from-purple-600 to-indigo-600 text-white shadow-[0_0_25px_rgba(168,85,247,0.4)]">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            SecureDoc <span className="text-purple-400">Vault</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Sistem Brankas Dokumen Terenkripsi End-to-End (AES-256-GCM &
            SHA-256)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-[#0e112a] border border-purple-500/20 px-4 py-2 rounded-full self-start md:self-auto">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-mono text-slate-300">
          Zero-Knowledge Storage Active
        </span>
      </div>
    </header>
  );
}
