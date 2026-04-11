# Perencana Fitur Penomoran Halaman (Pagination) Pesan

## Deskripsi
Fitur ini memungkinkan aplikasi untuk memuat riwayat pesan secara bertahap (per batch). Saat pengguna menggulir ke atas untuk melihat pesan lama, aplikasi akan secara otomatis memanggil API untuk mengambil batch pesan berikutnya. Hal ini meningkatkan performa aplikasi dan menghemat penggunaan data.

## Komponen Utama
1. **Layar Chat (`app/chat/[id].tsx`)**:
   - Menambahkan state `cursor` untuk melacak tanda (timestamp/ID) pesan tertua yang sudah dimuat.
   - Menambahkan state `hasMore` untuk mengetahui apakah masih ada pesan lama di server.
2. **Integrasi API**:
   - Endpoint: `GET /v1/messages/{conversationId}?limit=20&cursor={cursor}`.
   - Limit default: 20 pesan per muatan.
3. **Logika Scroll (Load More)**:
   - Menggunakan deteksi scroll ke atas atau komponen `ActivityIndicator` di bagian atas list.
   - Penggabungan data: Pesan baru yang diambil harus diletakkan di **awal** array pesan saat ini.
4. **UX**:
   - Menjaga posisi scroll setelah memuat pesan lama agar pengguna tidak bingung (Mencegah list "lompat").

## Referensi API
- REST: `GET /v1/messages/{conversationId}?limit=20&cursor={cursor}`
- Respons: Mengembalikan array pesan sesuai kriteria cursor.

## Catatan Implementasi
- **Cursor-Based**: Menggunakan timestamp `created_at` dari pesan tertua sebagai cursor untuk tarikan berikutnya.
- **Prepend Data**: Pesan lama digabungkan di bagian atas array `messages`.
- **UX Scroll**: Menggunakan flag `isInitialLoad` untuk memastikan scroll otomatis ke bawah hanya terjadi pada pembukaan chat pertama kali, sehingga saat memuat pesan lama posisi scroll tidak terganggu.

