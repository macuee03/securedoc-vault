# SecureDoc Vault

SecureDoc Vault adalah aplikasi penyimpanan dan berbagi dokumen dengan
enkripsi AES-256-GCM, verifikasi integritas SHA-256, serta kontrol akses
berbasis PIN dan masa berlaku tautan.

## Menjalankan aplikasi

Pasang dependensi, siapkan `DATABASE_URL` pada `.env`, lalu jalankan:

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di peramban.

## Perintah yang tersedia

- `npm run dev` menjalankan server pengembangan.
- `npm run lint` memeriksa kualitas kode.
- `npm run build` membuat build produksi.
- `npm run start` menjalankan build produksi.

## Fitur utama

- Mengunggah dokumen hingga 5 MB.
- Mengenkripsi dokumen sebelum disimpan.
- Mengunduh dokumen setelah proses dekripsi dan verifikasi integritas.
- Membuat tautan berbagi dengan PIN, batas akses, dan masa berlaku.
- Menampilkan riwayat akses untuk setiap dokumen.
