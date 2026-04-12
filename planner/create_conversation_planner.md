# Planner: Fitur Buat Percakapan Baru (DM & Grup)

Tujuan: Mengimplementasikan layar baru untuk mencari pengguna dan membuat percakapan baik itu Direct Message (DM) atau Grup Chat sesuai dengan dokumentasi API.

## Referensi API
- **Endpoint**: `POST /v1/conversations`
- **Tipe**: `multipart/form-data`
- **Fields**: 
  - `type` (dm/group)
  - `title` (opsional untuk DM, wajib untuk Grup)
  - `participantIds` (ID peserta)
  - `photo` (avatar grup)

## Alur Kerja
1. **Layar Pemilihan Peserta (`new-chat.tsx`)**:
   - Menampilkan daftar pengguna dengan fitur pencarian.
   - Mendukung multi-select dengan menyimpan objek `UserData` utuh (untuk menghindari kehilangan data saat pencarian berubah).
2. **Konfigurasi Grup (`create-group.tsx`)**:
   - Layar terpisah untuk memasukkan Nama Grup.
   - Menampilkan review peserta yang dipilih.
3. **Integrasi API**:
   - Menggunakan `FormData` untuk `POST /v1/conversations`.
   - `participantIds` dikirim sebagai string yang dipisahkan koma.
4. **Navigasi**:
   - Berhasil -> Redirect ke `app/chat/[id]`.

## Tech Stack
- **React Native / Expo Router**
- **Lucide React Native** (Ikon)
- **SecureStore** (Token akses)
