export type TourStep = {
  /** target CSS selector; kalau kosong / tidak ditemukan, kartu tampil di tengah */
  target?: string;
  title: string;
  body: string;
};

const COMMON_END: TourStep[] = [
  {
    target: '[data-tour="nav"]',
    title: "Pindah halaman",
    body: "Gunakan menu ini untuk berpindah antar halaman. Di layar HP, buka lewat tombol menu di kanan atas.",
  },
  {
    target: '[data-tour="help"]',
    title: "Ulangi tutorial",
    body: "Tekan tombol ini kapan saja untuk memutar ulang panduan halaman yang sedang dibuka.",
  },
];

function page(steps: TourStep[]): TourStep[] {
  return [...steps, ...COMMON_END];
}

export const TOURS: Record<string, TourStep[]> = {
  "/": page([
    {
      title: "Selamat datang di Inventaris Lavin Kost",
      body: "Halaman Ringkasan menampilkan kondisi inventaris kamar dan fasilitas secara singkat.",
    },
    {
      target: '[data-tour="page-title"]',
      title: "Judul halaman",
      body: "Setiap halaman punya judul dan deskripsi singkat di bagian atas.",
    },
  ]),
  "/dashboard": page([
    {
      target: '[data-tour="dashboard-period"]',
      title: "Filter periode",
      body: "Pilih Hari ini, Bulan ini, Tahun ini, atau rentang tanggal kustom. Semua angka dan grafik mengikuti pilihan ini.",
    },
    {
      target: '[data-tour="dashboard-stats"]',
      title: "Kartu statistik",
      body: "Ringkasan jumlah kamar, unit barang, barang yang perlu perhatian, dan saldo periode berjalan.",
    },
    {
      target: '[data-tour="dashboard-charts"]',
      title: "Grafik",
      body: "Perbandingan pendapatan vs pengeluaran, tren saldo bulanan, kategori pengeluaran, serta kondisi barang.",
    },
  ]),
  "/kamar": page([
    {
      target: '[data-tour="kamar-search"]',
      title: "Cari kamar",
      body: "Ketik nomor kamar atau nama barang untuk menyaring daftar kamar dengan cepat.",
    },
    {
      target: '[data-tour="kamar-add"]',
      title: "Tambah kamar",
      body: "Buat kamar baru lengkap dengan nomor, lantai, dan keterangan.",
    },
    {
      title: "Buka detail kamar",
      body: "Ketuk kartu kamar untuk melihat daftar barang, kondisi, foto, dan menambah barang baru.",
    },
  ]),
  "/denah": page([
    {
      target: '[data-tour="denah-floors"]',
      title: "Pilih lantai",
      body: "Beralih antara Lantai 1, 2, 3, dan Rooftop sesuai denah arsitektur asli.",
    },
    {
      target: '[data-tour="denah-map"]',
      title: "Klik area kamar",
      body: "Ketuk area pada denah untuk melihat penyewa aktif, jumlah barang, dan kondisi inventaris kamar tersebut.",
    },
    {
      title: "Arti warna",
      body: "Area berwarna utama = kamar terisi, abu-abu = kosong, hijau = fasilitas bersama. Titik merah menandai barang rusak, titik kuning garansi hampir habis.",
    },
  ]),
  "/tenant": page([
    {
      title: "Data penyewa",
      body: "Kelola penyewa aktif dan riwayatnya: identitas, kontak, kendaraan, serta kamar yang ditempati.",
    },
    {
      title: "Catat pembayaran",
      body: "Gunakan tombol pembayaran pada kartu penyewa untuk mencatat sewa masuk beserta buktinya.",
    },
    {
      title: "Riwayat status",
      body: "Perubahan status penyewa (aktif, keluar) tercatat otomatis sebagai riwayat.",
    },
  ]),
  "/pendapatan": page([
    {
      title: "Pendapatan",
      body: "Catat pemasukan sewa maupun pendapatan lain di halaman ini.",
    },
    {
      title: "Bukti transaksi",
      body: "Unggah foto atau PDF bukti pembayaran saat menambah data agar mudah diaudit.",
    },
  ]),
  "/pengeluaran": page([
    {
      title: "Pengeluaran",
      body: "Tambahkan biaya operasional beserta kategori dan lokasi pengeluaran.",
    },
    {
      title: "Bukti & lampiran",
      body: "Unggah nota atau struk; sistem otomatis mengompres gambar agar hemat kuota.",
    },
  ]),
  "/jurnal": page([
    {
      title: "Jurnal umum",
      body: "Semua pendapatan dan pengeluaran digabung menjadi satu jurnal berurutan tanggal.",
    },
    {
      title: "Atur kolom & periode",
      body: "Pilih preset periode, atur kolom yang tampil, lalu ekspor ke PDF atau Excel.",
    },
  ]),
  "/laporan": page([
    {
      title: "Laporan",
      body: "Susun laporan inventaris dan keuangan sesuai periode yang dibutuhkan.",
    },
    {
      title: "Ekspor",
      body: "Gunakan pengaturan kolom lalu ekspor hasilnya ke PDF atau Excel.",
    },
  ]),
  "/kelola": page([
    {
      title: "Kelola data master",
      body: "Atur daftar kondisi barang, lokasi pengeluaran, dan data pendukung lainnya di sini.",
    },
  ]),
  "/fasilitas": page([
    {
      title: "Fasilitas utama",
      body: "Barang milik bersama (di luar kamar) dicatat di halaman ini lengkap dengan lokasi dan kondisinya.",
    },
  ]),
};

export function tourForPath(pathname: string): TourStep[] {
  if (TOURS[pathname]) return TOURS[pathname]!;
  if (pathname.startsWith("/kamar")) return TOURS["/kamar"]!;
  return TOURS["/"]!;
}
