# Perencana Fitur Semat Pesan (Pin Message)

## Deskripsi
Fitur ini memungkinkan pengguna untuk menyematkan pesan penting agar muncul di bagian atas percakapan. Pencantuman pesan ini bersifat global (terlihat oleh semua peserta) dan membantu mempermudah akses ke informasi penting.

## Komponen Utama
1. **Layar Chat (`app/chat/[id].tsx`)**:
   - Pinned Bar diintegrasikan langsung sebagai ekstensi header (Full width, latar belakang putih).
   - Menampilkan satu baris ringkas: `[Ikon Pin] [Nama Pengirim]: [Konten Pesan]`.
   - Menggunakan pemisah garis halus (`hairline border`) di bagian bawah untuk transisi ke chat.
2. **Integrasi API**:
   - Endpoint: `PUT /v1/messages/{id}/pin` dengan body `{ "isPinned": boolean }`.
3. **Logika Real-time (WebSocket)**:
   - Terhubung dengan event `message.pinned` untuk sinkronisasi otomatis antar perangkat.
4. **Interaksi Multi-Pin**:
   - Mendukung hingga 3 pesan sematan.
   - Dilengkapi dengan *badge* angka kecil di sisi kanan sebagai indikator tumpukan.
   - Navigasi "Jump to Message" & *Cycling* konten saat bar diklik.


## Referensi API
- REST: `PUT /v1/messages/{id}/pin`
- WebSocket: `message.pin` (Emit)
- WebSocket: `message.pinned` (Listen)
