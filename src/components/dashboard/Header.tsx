import Image from "next/image";

export default function Header() {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-teal-500/15 pb-7">
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950/80 border border-slate-600/50 shadow-[0_0_28px_rgba(45,212,191,0.16)] shrink-0 flex items-center justify-center overflow-hidden">
          <Image
            src="/logo.png"
            alt="SecureDoc Vault"
            width={64}
            height={64}
            className="w-full h-full object-contain p-1"
            priority
          />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-teal-300/70 mb-1">
            Pusat Dokumen
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            SecureDoc <span className="text-teal-300">Vault</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
            Penyimpanan dokumen dengan enkripsi AES-256-GCM dan verifikasi
            SHA-256
          </p>
        </div>
      </div>
    </header>
  );
}
