# Petualangan Literasi Digital — perbaikan penyimpanan buku

## Perbaikan utama
- Buku yang diunggah admin disimpan di server, bukan hanya IndexedDB browser admin.
- Katalog buku dibaca melalui `/api/books`, sehingga siswa pada perangkat/browser lain melihat buku yang sama.
- File PDF asli disimpan di folder `uploads/`; metadata buku tersimpan di `data/books.json`.
- Batas ukuran PDF: 100 MB.

## Menjalankan aplikasi
1. Pastikan Node.js terpasang.
2. Ekstrak seluruh isi ZIP ke satu folder.
3. Buka terminal di folder tersebut.
4. Jalankan `npm install`.
5. Jalankan `npm start`.
6. Buka `http://localhost:3000`.

Jangan membuka `index.html` dengan klik ganda (`file://`), karena API penyimpanan bersama memerlukan server. Untuk akses dari perangkat siswa, host aplikasi pada server yang bisa diakses bersama atau gunakan IP komputer server dalam jaringan sekolah. Pastikan folder `data/` dan `uploads/` tetap tersimpan pada disk persisten di hosting; jangan gunakan penyimpanan sementara.

## Catatan
Data buku yang baru diunggah akan dibagikan melalui server. Data lama yang tersimpan hanya di IndexedDB browser admin tidak dapat dipindahkan otomatis; unggah kembali PDF tersebut melalui aplikasi yang sudah diperbaiki. Folder `data/` dan `uploads/` dibuat otomatis saat server dijalankan.
