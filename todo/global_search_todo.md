# Daftar Tugas Cari Pesan Global

- [x] Tambahkan state `searchQuery` dan `searchResultMessages` di `app/(tabs)/chats.tsx`.
- [x] Buat fungsi `handleGlobalSearch` untuk memanggil API `GET /v1/messages/search/global`.
- [x] Pasang *listener* pada `TextInput` pencarian untuk memicu fungsi search (dengan *debounce*).
- [x] Modifikasi UI `chats.tsx`:
    - [x] Sembunyikan daftar chat utama saat sedang mencari (digantikan hasil pesan).
    - [x] Tampilkan daftar hasil pesan (`SearchResults`).
- [x] Implementasi navigasi dari hasil pencarian ke layar chat yang sesuai.
- [x] Pengujian: Pencarian global berfungsi dengan baik dan navigasi lancar.
