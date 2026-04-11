# Perencana Fitur Filter Chat (All, Unread, Groups)

## Deskripsi
Implementasi barisan chip filter di bawah navigasi pencarian untuk menyaring daftar percakapan berdasarkan status (Sudah Baca/Belum) dan jenis (Individu/Grup).

## Komponen Utama
1. **State Management**: Menambahkan state `activeFilter` untuk melacak pilihan pengguna.
2. **Logika Penyaringan (Client-side)**:
   - **All**: Menampilkan semua chat.
   - **Unread**: Menampilkan chat dengan `unread_count > 0`.
   - **Groups**: Menampilkan chat dengan tipe `group` atau `project`.
3. **Penyelarasan UI**: Mengikuti desain premium sesuai screenshot:
   - Chip aktif dengan latar belakang hijau terang dan teks hijau gelap.
   - Chip tidak aktif dengan garis tepi abu-abu.
   - Penempatan di antara bilah pencarian dan daftar pesan.

## Referensi API
- `GET /conversations` menyediakan field `unread_count` dan `type`.
- Pemetaan tipe: `dm` (Individu), `group`/`project` (Grup).
