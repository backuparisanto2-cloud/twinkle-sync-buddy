# Splashscreen, Denah Gambar Baru, dan Tur Tutorial per Halaman

## 1. Unggah ulang gambar dari attachment
Aset denah dan splash yang ada sekarang masih menunjuk ke penyimpanan project lama (project_id berbeda), jadi gambarnya berisiko tidak tampil di project ini. Semua gambar attachment akan diunggah ulang ke CDN project ini:

- IMG-20260821-WA0002.jpg → gambar bangunan untuk splashscreen (dibuat juga versi kecil 360px/480px agar cepat di HP)
- IMG-20260821-WA0034.jpg → Denah Lantai 1
- IMG-20260821-WA0031.jpg → Denah Lantai 2
- IMG-20260821-WA0032.jpg → Denah Lantai 3
- IMG-20260821-WA0033.jpg → Denah Rooftop

Pointer aset lama diganti dengan yang baru, sehingga `src/lib/floorplan.ts` dan `SplashScreen.tsx` langsung memakai gambar baru tanpa mengubah koordinat hotspot (rasio gambar sama dengan yang dipakai saat koordinat dibuat). Setelah itu tampilan denah tiap lantai dicek satu per satu; kalau ada pergeseran area kamar, crop/koordinat disesuaikan.

## 2. Splashscreen tampil lebih dulu
- Splash dirender langsung saat aplikasi dibuka (tanpa kedip halaman utama): konten utama disembunyikan sampai splash selesai.
- Durasi ±2,2 detik lalu fade-out; bisa dilewati dengan mengetuk layar.
- Gambar bangunan baru sebagai latar penuh, dengan gradasi gelap, logo, judul "Lavin Kost Purwokerto", dan bar loading emas seperti sekarang tetapi dirapikan untuk layar HP.
- Tetap tampil sekali per sesi browser (buka tab baru = muncul lagi), tidak mengganggu saat pindah halaman.

## 3. Tombol tutorial (tur) per halaman
- Tombol ikon tanda tanya di header aplikasi (AppShell), tampil di semua halaman.
- Menekan tombol memulai tur berlangkah: elemen penting disorot, ada kotak penjelasan dengan tombol Lanjut / Kembali / Selesai dan indikator langkah (mis. 2/5).
- Langkah tur ditulis per halaman dalam Bahasa Indonesia, contoh:
  - Ringkasan/Dashboard: filter periode, kartu statistik, grafik pendapatan-pengeluaran
  - Kamar: cari kamar, tambah kamar, buka detail & barang
  - Denah: pilih lantai, klik area kamar, arti warna & penanda kondisi
  - Tenant: tambah penyewa, catat pembayaran, riwayat status
  - Pengeluaran / Pendapatan: tambah transaksi, unggah bukti, filter
  - Laporan / Jurnal: pilih periode, atur kolom, ekspor PDF/Excel
  - Kelola & Fasilitas: master data kondisi, lokasi, barang bersama
- Tur otomatis muncul sekali saat halaman pertama kali dikunjungi (disimpan di localStorage), dan bisa diulang kapan saja lewat tombol.
- Pada layar HP, kotak penjelasan menempel di bawah layar agar tidak menutupi elemen yang disorot.

## Catatan teknis
- Tur dibuat sebagai komponen sendiri (`src/components/PageTour.tsx` + daftar langkah di `src/lib/tour-steps.ts`) memakai overlay + `getBoundingClientRect` pada target `data-tour="..."`, tanpa menambah dependensi baru; atribut `data-tour` ditambahkan ke elemen kunci tiap halaman.
- Splash dikendalikan dari `src/routes/__root.tsx` agar muncul sebelum konten utama, memakai state hidrasi-aman (tanpa mismatch SSR).
- Aset baru dibuat lewat `lovable-assets`; file pointer lama yang tak terpakai dihapus.
