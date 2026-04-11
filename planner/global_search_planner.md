# Perencana Fitur Cari Pesan Global

## Deskripsi
Fitur ini memungkinkan pengguna untuk mencari kata atau kalimat tertentu di seluruh obrolan yang pernah ada. Hasil pencarian akan menampilkan potongan pesan beserta nama pengirim/percakapannya.

## Komponen Utama
1. **Layar Utama (`app/(tabs)/chats.tsx`)**:
   - Menghubungkan kolom 'Search' dengan state pencarian.
   - Implementasi logika *debounce*- [x] Tambahkan state `searchQuery` dan `searchResultMessages` di `app/(tabs)/chats.tsx`.
- [x] Buat fungsi `handleGlobalSearch` untuk memanggil API `GET /v1/messages/search/global`.
- [x] Pasang *listener* pada `TextInput` pencarian untuk memicu fungsi search (dengan *debounce*).
- [x] Modifikasi UI `chats.tsx`:
    - [x] Sembunyikan daftar chat utama saat sedang mencari (digantikan hasil pesan).
    - [x] Tampilkan daftar hasil pesan (`SearchResults`).
- [x] Implementasi navigasi dari hasil pencarian ke layar chat yang sesuai.
- [x] Perbaikan UI: Menampilkan nama pengirim asli, bukan sekadar placeholder "Chat".
- [x] Pengujian: Pencarian global berfungsi dengan baik dan navigasi lancar.
m layar chat tersebut.

## Referensi API
- REST: `GET /v1/messages/search/global?q={query}`
- WebSocket: `messages.search.global` (sebagai alternatif).

## Catatan Implementasi
- **Debounce**: Menggunakan jeda 500ms untuk optimasi API.
- **UI Switching**: Daftar chat utama digantikan sepenuhnya oleh hasil pencarian saat `searchQuery` terisi.
- **Data Mapping**: Menggunakan fallback nama yang cerdas (`conversation.title || sender.name || recipient.name`) untuk memastikan nama user muncul dengan benar di hasil pencarian.

