# Perencana Fitur Cari Pesan dalam Percakapan (Local Search)

## Deskripsi
Fitur ini memungkinkan pengguna untuk mencari kata kunci spesifik di dalam satu percakapan yang sedang dibuka. Ini mempermudah pencarian informasi tanpa harus menggulir riwayat pesan yang sangat panjang.

## Komponen Utama
1. **Header Chat (`app/chat/[id].tsx`)**:
   - Menambahkan ikon pencarian di pojok kanan atas chat.
   - Implementasi mode "Searching" di mana judul nama user digantikan oleh kolom input pencarian.
2. **Integrasi API**:
   - Menggunakan endpoint REST `GET /v1/messages/search/:conversationId?q=query`.
3. **Hasil Pencarian**:
   - Menampilkan daftar pesan yang cocok dalam bentuk overlay atau daftar ringkas.
   - (Opsional) Implementasi fungsi 'Jump' untuk menggulir chat ke posisi pesan tersebut.
4. **UX**:
   - Tombol 'X' untuk menutup mode pencarian dan kembali ke tampilan normal.

## Referensi API
- REST: `GET /v1/messages/search/:conversationId?q={query}`
- WebSocket: `messages.search.local`
