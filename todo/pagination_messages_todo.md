# Daftar Tugas Penomoran Halaman (Pagination) Pesan

- [x] Tambahkan state `cursor` (string | null) dan `hasMore` (boolean) di `app/chat/[id].tsx`.
- [x] Refaktor `fetchMessages` menjadi `loadMessages(isLoadMore)`:
    - [x] Jika `isLoadMore`, tambahkan query parameter `cursor` dan `limit`.
    - [x] Update state `messages` dengan cara menggabungkan data lama (prepend).
    - [x] Simpan timestamp pesan tertua sebagai `cursor` baru.
- [x] Implementasi UI:
    - [x] Tambahkan `ActivityIndicator` di `ListHeaderComponent` saat sedang memuat pesan lama.
    - [x] Gunakan properti `onScroll` untuk memicu pemuatan otomatis saat mencapai batas atas.
- [x] Optimasi UX: Menangani `isInitialLoad` agar list tidak lompat ke bawah saat memuat riwayat lama.
- [x] Pengujian: Berhasil memuat riwayat pesan lama secara bertahap (batch 20).
