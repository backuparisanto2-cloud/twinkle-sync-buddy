# Tutorial otomatis dan kode inventaris konsisten

## Tujuan
- Tutorial terbuka otomatis **sekali pada kunjungan pertama setiap jenis halaman**, setelah splashscreen selesai, dan tetap dapat diputar ulang lewat tombol bantuan.
- Semua barang kamar dan fasilitas memiliki kode unik otomatis berformat **NAMA-BARANG-DDMMYY-URUTAN**, misalnya `LEMARI-PAKAIAN-210826-01`.
- Kode tampil dan dapat dicari secara konsisten di seluruh aplikasi, termasuk laporan dan ekspor.

## Perubahan yang akan dibuat

### 1. Perbaiki tutorial otomatis
- Sinkronkan pemicu tutorial dengan status “aplikasi siap” agar timer baru berjalan sesudah splashscreen hilang dan target halaman sudah ter-render.
- Gunakan kunci penyimpanan tutorial yang berversi agar status lama dari implementasi yang bermasalah tidak mencegah tutorial baru muncul.
- Catat “sudah dilihat” per jenis halaman; seluruh detail kamar memakai satu tutorial halaman kamar, bukan mengulang untuk setiap nomor kamar.
- Pertahankan tombol bantuan untuk memutar tutorial kapan pun, tanpa mengubah status otomatis halaman lain.

### 2. Jadikan kode sebagai aturan database
- Tambahkan migrasi yang mengisi tanggal beli data lama dari tanggal pencatatannya, lalu membuat `purchase_date` wajib untuk barang kamar dan fasilitas.
- Isi kode untuk seluruh data lama dengan format nama lengkap yang dinormalisasi menjadi slug huruf/angka, tanggal `DDMMYY`, dan urutan dua digit atau lebih bila diperlukan.
- Tambahkan generator kode di database dengan penguncian transaksi agar dua penyimpanan bersamaan tidak menghasilkan kode yang sama, termasuk antara barang kamar dan fasilitas.
- Tambahkan validasi/indeks agar kode tidak kosong atau ganda; kode dibuat ulang secara deterministik ketika nama atau tanggal beli berubah.

### 3. Selaraskan form dan alur aplikasi
- Wajibkan tanggal pembelian pada form tambah/edit inventaris.
- Tampilkan pratinjau kode otomatis berdasarkan nama dan tanggal, tetapi jadikan kode final dari database sebagai sumber kebenaran.
- Setelah simpan, ambil dan tampilkan kode final; hapus generator urutan sisi browser yang rawan bentrok.
- Pastikan pembuatan item standar juga menyertakan tanggal sehingga setiap item langsung mendapat kode.

### 4. Terapkan kode di seluruh tampilan
- Tampilkan kode pada kartu barang kamar dan fasilitas.
- Sertakan kode dalam pencarian barang kamar/fasilitas.
- Aktifkan kode pada denah dan detail area menggunakan dukungan chip kode yang sudah tersedia.
- Tambahkan kode pada PDF ringkas fasilitas serta pastikan tabel laporan, pratinjau PDF, PDF, Excel, dan CSV selalu menyertakan kolom kode secara default.

## Verifikasi
- Uji splashscreen → tutorial otomatis, navigasi ke halaman baru, kunjungan ulang, dan tombol putar ulang.
- Uji tambah/edit barang kamar dan fasilitas, termasuk dua barang bernama dan bertanggal sama, untuk memastikan urutan unik.
- Pastikan semua data lama memiliki tanggal dan kode, tanpa duplikasi di kedua tabel inventaris.
- Uji pencarian kode, kartu, denah, laporan, dan seluruh format ekspor pada desktop serta mobile.

## Detail teknis
- Kondisi database saat ini: seluruh **288 barang kamar** dan **13 fasilitas** belum memiliki tanggal beli maupun kode, sehingga backfill diperlukan sebelum kolom dapat diwajibkan.
- Format slug akan memakai nama lengkap huruf/angka kapital dengan tanda hubung antarkata; urutan dihitung global lintas barang kamar dan fasilitas untuk prefix nama+tanggal yang sama.
