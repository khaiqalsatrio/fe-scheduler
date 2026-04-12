# Planner: Redesain Layar Buat Grup (Premium V2)

Tujuan: Mengimplementasikan desain "Buat Grup" yang bersih dan modern sesuai gambar referensi terbaru.

## Konsep Desain V2
1. **Header & Persona**:
    - Title: "Buat Grup" (weight 800).
    - Central Avatar: Ikon `Users` biru dalam lingkaran besar berwarna biru muda (#E0EEFF).
2. **Group Naming Section**:
    - Label: "Nama Grup" (size 14, semi-bold).
    - Input: Background F3F4F6, rounded 12-15, tanpa border bawah tebal (gaya modern).
3. **Participants Section**:
    - Section Header: "Anggota (n)".
    - Card Item: Menampilkan avatar, nama bold, dan sub-teks role/instansi (identik dengan gaya list item di Cari Koneksi).
4. **Floating CTA**:
    - Tombol "Buat Grup" (Rounded 26, Shadow lembut).
    - State: Grey (disable) jika nama kosong, Hijau Emerald jika terisi.

## Arsitektur Data
- **Params**: Menerima `participantIds` dan `participantNames`.
- **Parsing**: Mengambil data tambahan (jika dikirim dari layar sebelumnya) untuk menampilkan role.
